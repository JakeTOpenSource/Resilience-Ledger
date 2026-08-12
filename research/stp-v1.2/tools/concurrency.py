import itertools
import json
import pathlib
import sys


def canonical(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def same_set(left, right):
    return sorted(left) == sorted(right)


def validate_delta(profile, delta):
    if (delta["subject_id"] != profile["subject_id"] or delta["policy_id"] != profile["policy_id"] or
            delta["policy_generation"] != profile["policy_generation"]):
        return "POLICY_BINDING_MISMATCH"
    if not same_set(delta["causal_parents"], profile["causal_frontier"]):
        return "CAUSAL_FRONTIER_MISMATCH"
    return None


def predicate_holds(values, predicate):
    present = predicate["field"] in values
    actual = values.get(predicate["field"])
    operator, expected = predicate["operator"], predicate["value"]
    if operator == "EXISTS":
        return present == expected
    if not present:
        return False
    if operator == "EQ":
        return canonical(actual) == canonical(expected)
    if operator == "NE":
        return canonical(actual) != canonical(expected)
    if not isinstance(actual, (int, float)) or isinstance(actual, bool) or not isinstance(expected, (int, float)) or isinstance(expected, bool):
        return False
    return {
        "LT": actual < expected,
        "LTE": actual <= expected,
        "GT": actual > expected,
        "GTE": actual >= expected,
    }.get(operator, False)


def predicates_hold(values, delta):
    return all(predicate_holds(values, predicate) for predicate in delta.get("predicate_reads", []))


def run_schedule(profile, base_state, schedule):
    values = dict(base_state.get("values", {}))
    accepted, refused, effect_trace = [], [], []
    for delta in schedule:
        if not predicates_hold(values, delta):
            refused.append(delta["delta_id"])
            continue
        candidate = dict(values)
        candidate.update(delta.get("writes", {}))
        for key, increment in delta.get("increments", {}).items():
            candidate[key] = candidate.get(key, 0) + increment
        violated = any(isinstance(limit, (int, float)) and not isinstance(limit, bool) and
                       isinstance(candidate.get(key), (int, float)) and candidate[key] > limit
                       for key, limit in profile["limits"].items())
        if violated:
            refused.append(delta["delta_id"])
            continue
        values = candidate
        accepted.append(delta["delta_id"])
        effect_trace.extend(effect["effect_id"] for effect in delta.get("effects", []))
    return {
        "projection": {"values": values, "accepted": sorted(accepted), "refused": sorted(refused)},
        "effect_trace": effect_trace,
    }


def schedule_classes(profile, base_state, deltas):
    runs = [run_schedule(profile, base_state, schedule) for schedule in itertools.permutations(deltas)]
    return {
        "schedule_count": len(runs),
        "projection_count": len({canonical(run["projection"]) for run in runs}),
        "effect_count": len({canonical(run["effect_trace"]) for run in runs}),
    }


def analyze_batch(profile, item):
    if item["termination_evidence"] != "FINITE_ENUMERATION":
        return {"status": "UNKNOWN", "reason_code": "TERMINATION_NOT_PROVEN", "schedule_count": 0, "pairwise_all_commute": False}
    for delta in item["deltas"]:
        rejection = validate_delta(profile, delta)
        if rejection:
            return {"status": "FAIL", "reason_code": rejection, "schedule_count": 0, "pairwise_all_commute": False}
    if any(not predicates_hold(item["base_state"].get("values", {}), delta) for delta in item["deltas"]):
        return {"status": "FAIL", "reason_code": "PRECONDITION_FAILED", "schedule_count": 0, "pairwise_all_commute": False}
    full = schedule_classes(profile, item["base_state"], item["deltas"])
    pairs = list(itertools.combinations(item["deltas"], 2))
    pairwise_all = all((analysis := schedule_classes(profile, item["base_state"], list(pair)))["projection_count"] == 1 and
                       analysis["effect_count"] == 1 for pair in pairs)
    if full["projection_count"] > 1:
        return {
            "status": "FAIL",
            "reason_code": "PAIRWISE_INSUFFICIENT" if len(item["deltas"]) > 2 and pairwise_all else "ORDER_REQUIRED",
            "schedule_count": full["schedule_count"],
            "pairwise_all_commute": pairwise_all,
        }
    if full["effect_count"] > 1:
        return {"status": "FAIL", "reason_code": "EFFECT_ORDER_REQUIRED", "schedule_count": full["schedule_count"], "pairwise_all_commute": False}
    return {"status": "PASS", "reason_code": "COMMUTES", "schedule_count": full["schedule_count"], "pairwise_all_commute": pairwise_all}


def analyze_effect(profile, item):
    status, reason, effect_count = "UNKNOWN", "NO_EVENT", 0
    effects, keys = {}, {}
    for index, event in enumerate(item["events"]):
        expected_sequence = index + 1
        expected_previous = None if index == 0 else index
        if event["sequence"] != expected_sequence or event["previous_sequence"] != expected_previous:
            return {"status": "FAIL", "reason_code": "NONCONTIGUOUS_EFFECT_SEQUENCE", "effect_count": effect_count}
        if event["type"] != "OBSERVE" and event["policy_generation"] != profile["policy_generation"]:
            return {"status": "FAIL", "reason_code": "POLICY_BINDING_MISMATCH", "effect_count": effect_count}
        key_owner = keys.get(event["idempotency_key"])
        if key_owner is not None and key_owner != event["effect_id"]:
            return {"status": "FAIL", "reason_code": "EFFECT_ID_MISMATCH", "effect_count": effect_count}
        effect = effects.get(event["effect_id"])
        if effect is None and event["type"] != "PREPARE":
            return {"status": "FAIL", "reason_code": "EFFECT_ID_MISMATCH" if effects else "ILLEGAL_EFFECT_TRANSITION", "effect_count": effect_count}
        event_type = event["type"]
        if event_type == "PREPARE":
            if effect is not None:
                return {"status": "FAIL", "reason_code": "ILLEGAL_EFFECT_TRANSITION", "effect_count": effect_count}
            effect = {"state": "PREPARED", "idempotency_key": event["idempotency_key"], "dispatch_step": None,
                      "duplicate_pending": False, "outcomes": set()}
            effects[event["effect_id"]] = effect
            keys[event["idempotency_key"]] = event["effect_id"]
            status, reason = "UNKNOWN", "PREPARED_NOT_FINAL"
        elif effect["idempotency_key"] != event["idempotency_key"]:
            return {"status": "FAIL", "reason_code": "EFFECT_ID_MISMATCH", "effect_count": effect_count}
        elif event_type == "DISPATCH":
            if effect["state"] == "PREPARED":
                effect["state"], effect["dispatch_step"] = "DISPATCHED", event["effect_step"]
                effect_count += 1
                status, reason = "UNKNOWN", "DISPATCHED_NOT_FINAL"
            elif effect["state"] == "DISPATCHED":
                if event["effect_step"] - effect["dispatch_step"] <= profile["effect_policy"]["dedupe_retention_steps"]:
                    effect["duplicate_pending"] = True
                    status, reason = "UNKNOWN", "DUPLICATE_SUPPRESSION_UNVERIFIED"
                else:
                    effect_count += 1
                    effect["state"] = "DUPLICATE_RISK"
                    status, reason = "FAIL", "DUPLICATE_RISK"
            else:
                return {"status": "FAIL", "reason_code": "ILLEGAL_EFFECT_TRANSITION", "effect_count": effect_count}
        elif event_type == "DEDUPE_CONFIRM":
            if effect["state"] != "DISPATCHED" or not effect["duplicate_pending"]:
                return {"status": "FAIL", "reason_code": "ILLEGAL_EFFECT_TRANSITION", "effect_count": effect_count}
            effect["duplicate_pending"] = False
            status, reason = "PASS", "DUPLICATE_DEDUPED"
        elif event_type == "TIMEOUT":
            if effect["state"] != "DISPATCHED":
                return {"status": "FAIL", "reason_code": "ILLEGAL_EFFECT_TRANSITION", "effect_count": effect_count}
            effect["state"] = "EFFECT_UNKNOWN"
            status, reason = "UNKNOWN", "EFFECT_UNKNOWN"
        elif event_type == "OBSERVE":
            if effect["state"] not in {"DISPATCHED", "EFFECT_UNKNOWN", "OBSERVED"}:
                return {"status": "FAIL", "reason_code": "ILLEGAL_EFFECT_TRANSITION", "effect_count": effect_count}
            if event["policy_generation"] != profile["policy_generation"]:
                effect["state"] = "OBSERVATION_STALE"
                status, reason = "UNKNOWN", "OBSERVATION_STALE"
            else:
                effect["outcomes"].add(event["outcome"])
                if len(effect["outcomes"]) > 1:
                    effect["state"] = "OBSERVATION_CONFLICT"
                    status, reason = "UNKNOWN", "OBSERVATION_CONFLICT"
                else:
                    effect["state"] = "OBSERVED"
                    status, reason = "UNKNOWN", "OBSERVED_NOT_SETTLED"
        elif event_type == "SETTLE":
            if effect["state"] != "OBSERVED":
                return {"status": "FAIL", "reason_code": "ILLEGAL_EFFECT_TRANSITION", "effect_count": effect_count}
            effect["state"] = "SETTLED"
            status, reason = "PASS", "SETTLED"
        elif event_type == "REVOKE":
            if effect["state"] == "PREPARED":
                effect["state"] = "REFUSED"
                status, reason = "FAIL", "AUTHORITY_REVOKED_BEFORE_DISPATCH"
            elif effect["state"] in {"DISPATCHED", "EFFECT_UNKNOWN", "OBSERVED"}:
                effect["state"] = "EFFECT_UNKNOWN"
                status, reason = "UNKNOWN", "AUTHORITY_REVOKED_AFTER_DISPATCH"
            else:
                return {"status": "FAIL", "reason_code": "ILLEGAL_EFFECT_TRANSITION", "effect_count": effect_count}
    return {"status": status, "reason_code": reason, "effect_count": effect_count}


def analyze_capacity(profile, item):
    if item["unit"] != profile["limits"]["capacity_unit"]:
        return {"status": "FAIL", "reason_code": "CAPACITY_UNIT_MISMATCH", "max_backlog": None}
    lanes = ["observation", "settlement", "recovery"]
    lengths = [len(item.get("arrivals", {}).get(lane, [])) for lane in lanes] + [len(item.get("service", {}).get(lane, [])) for lane in lanes]
    if not lengths or len(set(lengths)) != 1 or lengths[0] < 1:
        return {"status": "FAIL", "reason_code": "CAPACITY_SHAPE_MISMATCH", "max_backlog": None}
    numeric_values = ([item["initial"][lane] for lane in lanes] + [profile["limits"]["buffers"][lane] for lane in lanes] +
                      [value for lane in lanes for value in item["arrivals"][lane]] +
                      [value for lane in lanes for value in item["service"][lane]])
    if any(not isinstance(value, (int, float)) or isinstance(value, bool) or value < 0 for value in numeric_values):
        return {"status": "FAIL", "reason_code": "CAPACITY_VALUE_INVALID", "max_backlog": None}
    backlog, maxima = dict(item["initial"]), dict(item["initial"])
    exceeded = False
    for step in range(lengths[0]):
        for lane in lanes:
            backlog[lane] = max(0, backlog[lane] + item["arrivals"][lane][step] - item["service"][lane][step])
            maxima[lane] = max(maxima[lane], backlog[lane])
            exceeded = exceeded or backlog[lane] > profile["limits"]["buffers"][lane]
    return {"status": "FAIL" if exceeded else "PASS", "reason_code": "CAPACITY_EXCEEDED" if exceeded else "CAPACITY_WITHIN_BOUNDS", "max_backlog": maxima}


def evaluate_fixture(fixture):
    return {
        "batch_cases": [{"case_id": item["case_id"], "result": analyze_batch(fixture["profile"], item)} for item in fixture["batch_cases"]],
        "effect_cases": [{"case_id": item["case_id"], "result": analyze_effect(fixture["profile"], item)} for item in fixture["effect_cases"]],
        "capacity_cases": [{"case_id": item["case_id"], "result": analyze_capacity(fixture["profile"], item)} for item in fixture["capacity_cases"]],
    }


if __name__ == "__main__":
    fixture = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    print(canonical(evaluate_fixture(fixture)))
