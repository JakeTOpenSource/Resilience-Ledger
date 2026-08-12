import hashlib
import json
import pathlib
import sys


def canonical(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def event_digest(event):
    material = dict(event)
    material.pop("event_hash", None)
    return "sha256:" + hashlib.sha256(canonical(material).encode("utf-8")).hexdigest()


def unique_map(items, field):
    result = {}
    for item in items:
        if item[field] in result:
            raise ValueError(f"duplicate {field}: {item[field]}")
        result[item[field]] = item
    return result


def context(fixture):
    return {
        "states": unique_map(fixture["state_model"]["states"], "state_id"),
        "transitions": unique_map(fixture["state_model"]["transitions"], "transition_id"),
        "instruments": unique_map(fixture["instrument_profiles"], "instrument_id"),
        "measurement_map": {entry["instrument_id"]: set(entry["check_ids"]) for entry in fixture["measurement_map"]},
    }


def result(status, reason_code, **extra):
    return {"status": status, "reason_code": reason_code, **extra}


def binding_matches(profile, instrument, event):
    return (event["subject_id"] == profile["subject_id"] and event["policy_id"] == profile["policy_id"] and
            event["policy_generation"] == profile["policy_generation"] and
            event["instrument_id"] == instrument["instrument_id"] and
            event["instrument_version"] == instrument["instrument_version"])


def legal_instrument_transition(ctx, instrument_id, source, target):
    return any(transition["kind"] == "INSTRUMENT" and transition.get("instrument_id") == instrument_id and
               transition["from"] == source and transition["to"] == target
               for transition in ctx["transitions"].values())


def measurement_contract_result(instrument, observation):
    binding = observation["measurement_binding"]
    measurement = instrument["measurement"]
    if (binding["procedure_ref"] != measurement["procedure_ref"] or
            binding["result_schema_ref"] != measurement["result_schema_ref"] or
            binding["unit"] != measurement["unit"] or
            binding["calibration_ref"] != measurement["calibration_ref"]):
        return result("FAIL", "MEASUREMENT_BINDING_MISMATCH")
    if binding["result_validation_status"] == "FAIL":
        return result("FAIL", "RESULT_SCHEMA_MISMATCH")
    if binding["result_validation_status"] == "UNKNOWN":
        return result("UNKNOWN", "RESULT_SCHEMA_VALIDATION_UNRESOLVED")
    if binding["calibration_status"] != "PASS":
        return result("UNKNOWN", "CALIBRATION_NOT_ESTABLISHED")

    expected = set(measurement["operating_conditions"])
    actual = {}
    for condition in observation["operating_condition_results"]:
        if condition["condition_id"] in actual:
            return result("FAIL", "OPERATING_CONDITION_SET_MISMATCH")
        actual[condition["condition_id"]] = condition["status"]
    if set(actual) != expected:
        return result("FAIL", "OPERATING_CONDITION_SET_MISMATCH")
    if any(status == "FAIL" for status in actual.values()):
        return result("UNKNOWN", "OUTSIDE_RATED_OPERATING_CONDITIONS")
    if any(status == "UNKNOWN" for status in actual.values()):
        return result("UNKNOWN", "OPERATING_CONDITIONS_UNRESOLVED")
    return None


def analyze_instrument_case(fixture, item):
    ctx = context(fixture)
    first = item["events"][0]
    instrument = ctx["instruments"].get(first["instrument_id"])
    initial = ctx["states"].get(item["initial_state"])
    if instrument is None:
        return result("FAIL", "UNKNOWN_INSTRUMENT", final_state=item["initial_state"])
    if instrument["subject_type"] != fixture["profile"]["subject_type"]:
        return result("FAIL", "INSTRUMENT_SUBJECT_TYPE_MISMATCH", final_state=item["initial_state"])
    if initial is None or not initial["legal"]:
        return result("FAIL", "ILLEGAL_STATE_CONFIGURATION", final_state=item["initial_state"])
    if item["initial_state"] not in instrument["allowed_states"]:
        return result("FAIL", "INSTRUMENT_STATE_INCOMPATIBLE", final_state=item["initial_state"])

    lifecycle, current_state, previous_id, previous_hash = "START", item["initial_state"], None, None
    event_ids, sensing_effect_event_id, observed_kind = set(), None, None
    for index, event in enumerate(item["events"]):
        if (event["sequence"] != index + 1 or event["previous_event_id"] != previous_id or
                event["previous_hash"] != previous_hash):
            return result("FAIL", "BROKEN_INSTRUMENT_SEQUENCE", final_state=current_state)
        if event["event_id"] in event_ids:
            return result("FAIL", "DUPLICATE_INSTRUMENT_EVENT_ID", final_state=current_state)
        event_ids.add(event["event_id"])
        if event_digest(event) != event["event_hash"]:
            return result("FAIL", "INSTRUMENT_EVENT_HASH_MISMATCH", final_state=current_state)
        previous_id = event["event_id"]
        previous_hash = event["event_hash"]
        if not binding_matches(fixture["profile"], instrument, event):
            return result("FAIL", "INSTRUMENT_BINDING_MISMATCH", final_state=current_state)
        after = ctx["states"].get(event["state_after"])
        if event["state_before"] != current_state or after is None or not after["legal"]:
            return result("FAIL", "ILLEGAL_STATE_CONFIGURATION", final_state=current_state)
        state_change_event = event["event_type"] in {"COMMIT", "SENSING_EFFECT"}
        commit_needs_declaration = (event["event_type"] == "COMMIT" and
                                    (instrument["state_write_set"] or instrument["effect_footprint"]))
        transition_required = (event["state_before"] != event["state_after"] or commit_needs_declaration or
                               event["event_type"] == "SENSING_EFFECT")
        if ((not state_change_event and event["state_before"] != event["state_after"]) or
                (transition_required and not legal_instrument_transition(
                    ctx, instrument["instrument_id"], event["state_before"], event["state_after"]))):
            return result("FAIL", "UNDECLARED_INSTRUMENT_TRANSITION", final_state=current_state)
        current_state = event["state_after"]
        event_type = event["event_type"]
        if event_type == "PLAN" and lifecycle == "START":
            lifecycle = "PLANNED"
        elif event_type == "AUTHORIZE" and lifecycle == "PLANNED" and instrument["authority_required"]:
            lifecycle = "AUTHORIZED"
        elif event_type == "INVOKE" and (lifecycle == "AUTHORIZED" or (lifecycle == "PLANNED" and not instrument["authority_required"])):
            lifecycle = "INVOKED"
        elif event_type == "COMMIT" and lifecycle == "INVOKED":
            lifecycle = "COMMITTED"
        elif event_type == "SENSING_EFFECT" and lifecycle == "COMMITTED" and instrument["sensing_effect_footprint"]:
            if (set(event["sensing_effect"]["footprint_ids"]) != set(instrument["sensing_effect_footprint"]) or
                    len(event["sensing_effect"]["footprint_ids"]) != len(instrument["sensing_effect_footprint"])):
                return result("FAIL", "SENSING_EFFECT_FOOTPRINT_MISMATCH", final_state=current_state)
            lifecycle, sensing_effect_event_id = "SENSING_RECORDED", event["event_id"]
        elif event_type == "OBSERVE" and lifecycle in {"COMMITTED", "SENSING_RECORDED"}:
            if instrument["sensing_effect_footprint"]:
                if sensing_effect_event_id is None:
                    reason = "SENSING_EFFECT_REFERENCE_UNRESOLVED" if event.get("sensing_effect_ref") else "SENSING_EFFECT_UNRECORDED"
                    return result("FAIL", reason, final_state=current_state)
                if event.get("sensing_effect_ref") != sensing_effect_event_id:
                    return result("FAIL", "SENSING_EFFECT_REFERENCE_UNRESOLVED", final_state=current_state)
            elif event.get("sensing_effect_ref"):
                return result("FAIL", "UNEXPECTED_SENSING_EFFECT_REFERENCE", final_state=current_state)
            lifecycle = "OBSERVED"
            observation = event["observation"]
            if observation["presence"] == "ABSENT":
                return result("UNKNOWN", "OBSERVATION_ABSENT", final_state=current_state)
            if observation["presence"] == "CENSORED":
                return result("UNKNOWN", "OBSERVATION_CENSORED", final_state=current_state)
            contract = measurement_contract_result(instrument, observation)
            if contract is not None:
                return {**contract, "final_state": current_state}
            observed_kind = observation["kind"]
            if observed_kind == "DOMAIN_NULL" and not instrument["measurement"]["domain_null_allowed"]:
                return result("FAIL", "DOMAIN_NULL_FORBIDDEN", final_state=current_state)
            if observed_kind == "NO_CHANGE_DETECTED":
                window = observation["window"]
                if (observation["resolution"]["unit"] != instrument["measurement"]["unit"] or
                        instrument["measurement"]["resolution"] is None or
                        observation["resolution"]["value"] < instrument["measurement"]["resolution"] or
                        window["end_step"] < window["start_step"] or
                        window["end_step"] - window["start_step"] + 1 > instrument["measurement"]["response_window_steps"]):
                    return result("FAIL", "MEASUREMENT_CONTRACT_MISMATCH", final_state=current_state)
        elif event_type == "SETTLE" and lifecycle == "OBSERVED":
            lifecycle = "SETTLED"
        else:
            return result("FAIL", "ILLEGAL_INSTRUMENT_TRANSITION", final_state=current_state)
    if lifecycle != "SETTLED":
        return result("UNKNOWN", "INSTRUMENT_NOT_SETTLED", final_state=current_state)
    if observed_kind == "DOMAIN_NULL":
        return result("PASS", "SETTLED_OBSERVED_NULL", final_state=current_state)
    if observed_kind == "NO_CHANGE_DETECTED":
        return result("PASS", "SETTLED_NO_CHANGE_DETECTED", final_state=current_state)
    return result("PASS", "SETTLED_OBSERVED_VALUE", final_state=current_state)


def bound_exceeded(counts, limits, depth):
    return counts["states"] > limits["max_states"] or counts["transitions"] > limits["max_transitions"] or depth > limits["max_depth"]


def analyze_survivability_case(fixture, item):
    ctx = context(fixture)
    initial = ctx["states"].get(item["initial_state"])
    if initial is None or not initial["legal"]:
        return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL")
    if not initial["safe"] or not initial["essential"]:
        return result("FAIL", "SURVIVAL_FALSIFIED")
    if item["horizon"] > item["traversal_limits"]["max_depth"]:
        return result("UNKNOWN", "TRAVERSAL_BOUND_REACHED")

    disturbances = [ctx["transitions"].get(identifier) for identifier in item["disturbance_transition_ids"]]
    if (len({entry["state_id"] for entry in item["controller"]}) != len(item["controller"]) or
            any(state not in ctx["states"] for state in item["recovery_target_states"])):
        return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL")
    controller = {entry["state_id"]: ctx["transitions"].get(entry["transition_id"]) for entry in item["controller"]}
    if any(transition is None or transition["kind"] != "DISTURBANCE" for transition in disturbances):
        return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL")
    if any(transition["from"] not in ctx["states"] or transition["to"] not in ctx["states"] for transition in disturbances):
        return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL")
    if any(transition is None or transition["kind"] != "CONTROL" or transition["from"] != state
           for state, transition in controller.items()):
        return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL")

    frontier, visited, transition_count = {item["initial_state"]}, {item["initial_state"]}, 0
    for depth in range(1, item["horizon"] + 1):
        next_frontier = set()
        for state_id in sorted(frontier):
            applicable = [transition for transition in disturbances if transition["from"] == state_id]
            disturbed_states = [state_id] + [transition["to"] for transition in applicable]
            transition_count += len(applicable)
            for disturbed_state in disturbed_states:
                visited.add(disturbed_state)
                if bound_exceeded({"states": len(visited), "transitions": transition_count}, item["traversal_limits"], depth):
                    return result("UNKNOWN", "TRAVERSAL_BOUND_REACHED")
                disturbed_definition = ctx["states"].get(disturbed_state)
                if disturbed_definition is None or not disturbed_definition["legal"]:
                    return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL")
                if not disturbed_definition["safe"] or not disturbed_definition["essential"]:
                    return result("FAIL", "SURVIVAL_FALSIFIED")
                control = controller.get(disturbed_state)
                if control is None:
                    return result("UNKNOWN", "CONTROLLER_UNDEFINED")
                controlled_state = control["to"]
                transition_count += 1
                visited.add(controlled_state)
                if bound_exceeded({"states": len(visited), "transitions": transition_count}, item["traversal_limits"], depth):
                    return result("UNKNOWN", "TRAVERSAL_BOUND_REACHED")
                controlled_definition = ctx["states"].get(controlled_state)
                if controlled_definition is None or not controlled_definition["legal"]:
                    return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL")
                if not controlled_definition["safe"] or not controlled_definition["essential"]:
                    return result("FAIL", "SURVIVAL_FALSIFIED")
                next_frontier.add(controlled_state)
        frontier = next_frontier
    if any(state not in item["recovery_target_states"] for state in frontier):
        return result("UNKNOWN", "RECOVERY_NOT_PROVEN")
    return result("PASS", "SURVIVAL_PROVEN_BOUNDED")


def within_budget(cost, budget):
    return all(cost[field] <= budget[field] for field in budget)


def cost_key(instrument, priority):
    return tuple(instrument["resource_bound"][field] for field in priority) + (instrument["instrument_id"],)


def analyze_economy_case(fixture, item):
    ctx = context(fixture)
    decisive = any(evidence["check_id"] == item["required_check_id"] and evidence["fresh"] and
                   evidence["result"] in {"PASS", "FAIL"} for evidence in item["current_evidence"])
    if decisive:
        return result("PASS", "EVIDENCE_ALREADY_DECISIVE", selected_instrument_id=None)
    initial = ctx["states"].get(item["initial_state"])
    if initial is None or not initial["legal"]:
        return result("UNKNOWN", "INVALID_ECONOMY_STATE", selected_instrument_id=None)
    assessment_ids = [entry["instrument_id"] for entry in item["instrument_assessments"]]
    if (len(set(assessment_ids)) != len(assessment_ids) or len(set(assessment_ids)) != len(item["candidate_instrument_ids"]) or
            any(identifier not in assessment_ids for identifier in item["candidate_instrument_ids"])):
        return result("UNKNOWN", "INVALID_ELIGIBILITY_EVIDENCE", selected_instrument_id=None)
    assessments = {entry["instrument_id"]: entry for entry in item["instrument_assessments"]}
    candidates = [ctx["instruments"].get(identifier) for identifier in item["candidate_instrument_ids"]]
    candidates = [instrument for instrument in candidates if instrument is not None]
    measuring = [instrument for instrument in candidates if item["required_check_id"] in ctx["measurement_map"].get(instrument["instrument_id"], set())]
    if not measuring:
        return result("UNKNOWN", "NO_MEASURING_INSTRUMENT", selected_instrument_id=None)
    authorized = [instrument for instrument in measuring if instrument["consequence_class"] in item["authorized_consequence_classes"]]
    if not authorized:
        return result("UNKNOWN", "NO_AUTHORIZED_INSTRUMENT", selected_instrument_id=None)
    if any(instrument["resource_bound"]["egress_bytes"] > instrument["privacy"]["max_egress_bytes"] or
           (instrument["resource_bound"]["egress_bytes"] > 0 and not instrument["privacy"]["egress_allowed"])
           for instrument in authorized):
        return result("UNKNOWN", "INSTRUMENT_PRIVACY_CONTRACT_INVALID", selected_instrument_id=None)
    compatible = []
    for instrument in authorized:
        assessment = assessments[instrument["instrument_id"]]
        authority_ok = (assessment["authority_status"] == "PASS" if instrument["authority_required"] else
                        assessment["authority_status"] in {"PASS", "NOT_REQUIRED"})
        recovery_ok = (assessment["recoverability_status"] == "PASS" if instrument["consequence_class"] != "READ_ONLY" else
                       assessment["recoverability_status"] in {"PASS", "NOT_REQUIRED"})
        privacy_ok = (instrument["resource_bound"]["egress_bytes"] == 0 or
                      (instrument["privacy"]["egress_allowed"] and
                       instrument["resource_bound"]["egress_bytes"] <= instrument["privacy"]["max_egress_bytes"]))
        if (instrument["subject_type"] == fixture["profile"]["subject_type"] and
                item["initial_state"] in instrument["allowed_states"] and assessment["guard_status"] == "PASS" and
                assessment["observability_status"] == "PASS" and authority_ok and recovery_ok and privacy_ok):
            compatible.append(instrument)
    if not compatible:
        unresolved = any("UNKNOWN" in {assessment["guard_status"], assessment["authority_status"],
                                       assessment["observability_status"], assessment["recoverability_status"]}
                         for assessment in (assessments[instrument["instrument_id"]] for instrument in authorized))
        reason = "COMPATIBILITY_UNRESOLVED" if unresolved else "NO_COMPATIBLE_INSTRUMENT"
        return result("UNKNOWN", reason, selected_instrument_id=None)
    affordable = [instrument for instrument in compatible if within_budget(instrument["resource_bound"], item["budget"])]
    if not affordable:
        return result("UNKNOWN", "RESOURCE_BOUND", selected_instrument_id=None)
    affordable.sort(key=lambda instrument: cost_key(instrument, fixture["resource_priority"]))
    return result("PASS", "LEAST_COST_INSTRUMENT_SELECTED", selected_instrument_id=affordable[0]["instrument_id"])


def evaluate_fixture(fixture):
    return {
        "instrument_cases": [{"case_id": item["case_id"], "result": analyze_instrument_case(fixture, item)} for item in fixture["instrument_cases"]],
        "survivability_cases": [{"case_id": item["case_id"], "result": analyze_survivability_case(fixture, item)} for item in fixture["survivability_cases"]],
        "economy_cases": [{"case_id": item["case_id"], "result": analyze_economy_case(fixture, item)} for item in fixture["economy_cases"]],
    }


if __name__ == "__main__":
    fixture = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    print(canonical(evaluate_fixture(fixture)))
