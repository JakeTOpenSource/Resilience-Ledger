import { createHash } from "node:crypto";

function canonical(value) {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
}

function eventDigest(event) {
  const material = { ...event };
  delete material.event_hash;
  return `sha256:${createHash("sha256").update(canonical(material), "utf8").digest("hex")}`;
}

function uniqueMap(items, field) {
  const result = new Map();
  for (const item of items) {
    if (result.has(item[field])) throw new Error(`duplicate ${field}: ${item[field]}`);
    result.set(item[field], item);
  }
  return result;
}

function context(fixture) {
  return {
    states: uniqueMap(fixture.state_model.states, "state_id"),
    transitions: uniqueMap(fixture.state_model.transitions, "transition_id"),
    instruments: uniqueMap(fixture.instrument_profiles, "instrument_id"),
    measurementMap: new Map(fixture.measurement_map.map((entry) => [entry.instrument_id, new Set(entry.check_ids)]))
  };
}

function result(status, reasonCode, extra = {}) {
  return { status, reason_code: reasonCode, ...extra };
}

function bindingMatches(profile, instrument, event) {
  return event.subject_id === profile.subject_id && event.policy_id === profile.policy_id &&
    event.policy_generation === profile.policy_generation && event.instrument_id === instrument.instrument_id &&
    event.instrument_version === instrument.instrument_version;
}

function legalInstrumentTransition(ctx, instrumentId, from, to) {
  return [...ctx.transitions.values()].some((transition) => transition.kind === "INSTRUMENT" &&
    transition.instrument_id === instrumentId && transition.from === from && transition.to === to);
}

function measurementContractResult(instrument, observation) {
  const binding = observation.measurement_binding;
  if (binding.procedure_ref !== instrument.measurement.procedure_ref ||
      binding.result_schema_ref !== instrument.measurement.result_schema_ref ||
      binding.unit !== instrument.measurement.unit ||
      binding.calibration_ref !== instrument.measurement.calibration_ref) {
    return result("FAIL", "MEASUREMENT_BINDING_MISMATCH");
  }
  if (binding.result_validation_status === "FAIL") return result("FAIL", "RESULT_SCHEMA_MISMATCH");
  if (binding.result_validation_status === "UNKNOWN") return result("UNKNOWN", "RESULT_SCHEMA_VALIDATION_UNRESOLVED");
  if (binding.calibration_status !== "PASS") return result("UNKNOWN", "CALIBRATION_NOT_ESTABLISHED");

  const expected = new Set(instrument.measurement.operating_conditions);
  const conditions = observation.operating_condition_results;
  const actual = new Map();
  for (const condition of conditions) {
    if (actual.has(condition.condition_id)) return result("FAIL", "OPERATING_CONDITION_SET_MISMATCH");
    actual.set(condition.condition_id, condition.status);
  }
  if (actual.size !== expected.size || [...expected].some((id) => !actual.has(id))) {
    return result("FAIL", "OPERATING_CONDITION_SET_MISMATCH");
  }
  if ([...actual.values()].some((status) => status === "FAIL")) return result("UNKNOWN", "OUTSIDE_RATED_OPERATING_CONDITIONS");
  if ([...actual.values()].some((status) => status === "UNKNOWN")) return result("UNKNOWN", "OPERATING_CONDITIONS_UNRESOLVED");
  return null;
}

export function analyzeInstrumentCase(fixture, item) {
  const ctx = context(fixture);
  const first = item.events[0];
  const instrument = ctx.instruments.get(first.instrument_id);
  const initial = ctx.states.get(item.initial_state);
  if (!instrument) return result("FAIL", "UNKNOWN_INSTRUMENT", { final_state: item.initial_state });
  if (instrument.subject_type !== fixture.profile.subject_type) return result("FAIL", "INSTRUMENT_SUBJECT_TYPE_MISMATCH", { final_state: item.initial_state });
  if (!initial?.legal) return result("FAIL", "ILLEGAL_STATE_CONFIGURATION", { final_state: item.initial_state });
  if (!instrument.allowed_states.includes(item.initial_state)) return result("FAIL", "INSTRUMENT_STATE_INCOMPATIBLE", { final_state: item.initial_state });

  let lifecycle = "START";
  let currentState = item.initial_state;
  let previousId = null;
  let previousHash = null;
  const eventIds = new Set();
  let sensingEffectEventId = null;
  let observedKind = null;
  for (let index = 0; index < item.events.length; index += 1) {
    const event = item.events[index];
    if (event.sequence !== index + 1 || event.previous_event_id !== previousId || event.previous_hash !== previousHash) {
      return result("FAIL", "BROKEN_INSTRUMENT_SEQUENCE", { final_state: currentState });
    }
    if (eventIds.has(event.event_id)) return result("FAIL", "DUPLICATE_INSTRUMENT_EVENT_ID", { final_state: currentState });
    eventIds.add(event.event_id);
    if (eventDigest(event) !== event.event_hash) return result("FAIL", "INSTRUMENT_EVENT_HASH_MISMATCH", { final_state: currentState });
    previousId = event.event_id;
    previousHash = event.event_hash;
    if (!bindingMatches(fixture.profile, instrument, event)) return result("FAIL", "INSTRUMENT_BINDING_MISMATCH", { final_state: currentState });
    if (event.state_before !== currentState || !ctx.states.get(event.state_after)?.legal) {
      return result("FAIL", "ILLEGAL_STATE_CONFIGURATION", { final_state: currentState });
    }
    const stateChangeEvent = new Set(["COMMIT", "SENSING_EFFECT"]).has(event.event_type);
    const commitNeedsDeclaration = event.event_type === "COMMIT" &&
      (instrument.state_write_set.length > 0 || instrument.effect_footprint.length > 0);
    const transitionRequired = event.state_before !== event.state_after || commitNeedsDeclaration || event.event_type === "SENSING_EFFECT";
    if ((!stateChangeEvent && event.state_before !== event.state_after) ||
        (transitionRequired && !legalInstrumentTransition(ctx, instrument.instrument_id, event.state_before, event.state_after))) {
      return result("FAIL", "UNDECLARED_INSTRUMENT_TRANSITION", { final_state: currentState });
    }
    currentState = event.state_after;

    if (event.event_type === "PLAN" && lifecycle === "START") lifecycle = "PLANNED";
    else if (event.event_type === "AUTHORIZE" && lifecycle === "PLANNED" && instrument.authority_required) lifecycle = "AUTHORIZED";
    else if (event.event_type === "INVOKE" && (lifecycle === "AUTHORIZED" || (lifecycle === "PLANNED" && !instrument.authority_required))) lifecycle = "INVOKED";
    else if (event.event_type === "COMMIT" && lifecycle === "INVOKED") lifecycle = "COMMITTED";
    else if (event.event_type === "SENSING_EFFECT" && lifecycle === "COMMITTED" && instrument.sensing_effect_footprint.length > 0) {
      if (new Set(event.sensing_effect.footprint_ids).size !== instrument.sensing_effect_footprint.length ||
          instrument.sensing_effect_footprint.some((id) => !event.sensing_effect.footprint_ids.includes(id))) {
        return result("FAIL", "SENSING_EFFECT_FOOTPRINT_MISMATCH", { final_state: currentState });
      }
      lifecycle = "SENSING_RECORDED";
      sensingEffectEventId = event.event_id;
    } else if (event.event_type === "OBSERVE" && new Set(["COMMITTED", "SENSING_RECORDED"]).has(lifecycle)) {
      if (instrument.sensing_effect_footprint.length > 0) {
        if (!sensingEffectEventId) {
          const reason = event.sensing_effect_ref ? "SENSING_EFFECT_REFERENCE_UNRESOLVED" : "SENSING_EFFECT_UNRECORDED";
          return result("FAIL", reason, { final_state: currentState });
        }
        if (event.sensing_effect_ref !== sensingEffectEventId) return result("FAIL", "SENSING_EFFECT_REFERENCE_UNRESOLVED", { final_state: currentState });
      } else if (event.sensing_effect_ref) {
        return result("FAIL", "UNEXPECTED_SENSING_EFFECT_REFERENCE", { final_state: currentState });
      }
      lifecycle = "OBSERVED";
      if (event.observation.presence === "ABSENT") return result("UNKNOWN", "OBSERVATION_ABSENT", { final_state: currentState });
      if (event.observation.presence === "CENSORED") return result("UNKNOWN", "OBSERVATION_CENSORED", { final_state: currentState });
      const contract = measurementContractResult(instrument, event.observation);
      if (contract) return { ...contract, final_state: currentState };
      observedKind = event.observation.kind;
      if (observedKind === "DOMAIN_NULL" && !instrument.measurement.domain_null_allowed) {
        return result("FAIL", "DOMAIN_NULL_FORBIDDEN", { final_state: currentState });
      }
      if (observedKind === "NO_CHANGE_DETECTED") {
        const window = event.observation.window;
        if (event.observation.resolution.unit !== instrument.measurement.unit ||
            instrument.measurement.resolution === null ||
            event.observation.resolution.value < instrument.measurement.resolution ||
            window.end_step < window.start_step ||
            window.end_step - window.start_step + 1 > instrument.measurement.response_window_steps) {
          return result("FAIL", "MEASUREMENT_CONTRACT_MISMATCH", { final_state: currentState });
        }
      }
    } else if (event.event_type === "SETTLE" && lifecycle === "OBSERVED") {
      lifecycle = "SETTLED";
    } else {
      return result("FAIL", "ILLEGAL_INSTRUMENT_TRANSITION", { final_state: currentState });
    }
  }
  if (lifecycle !== "SETTLED") return result("UNKNOWN", "INSTRUMENT_NOT_SETTLED", { final_state: currentState });
  if (observedKind === "DOMAIN_NULL") return result("PASS", "SETTLED_OBSERVED_NULL", { final_state: currentState });
  if (observedKind === "NO_CHANGE_DETECTED") return result("PASS", "SETTLED_NO_CHANGE_DETECTED", { final_state: currentState });
  return result("PASS", "SETTLED_OBSERVED_VALUE", { final_state: currentState });
}

function boundExceeded(counts, limits, depth) {
  return counts.states > limits.max_states || counts.transitions > limits.max_transitions || depth > limits.max_depth;
}

export function analyzeSurvivabilityCase(fixture, item) {
  const ctx = context(fixture);
  const initial = ctx.states.get(item.initial_state);
  if (!initial?.legal) return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL");
  if (!initial.safe || !initial.essential) return result("FAIL", "SURVIVAL_FALSIFIED");
  if (item.horizon > item.traversal_limits.max_depth) return result("UNKNOWN", "TRAVERSAL_BOUND_REACHED");

  const disturbances = item.disturbance_transition_ids.map((id) => ctx.transitions.get(id));
  if (new Set(item.controller.map((entry) => entry.state_id)).size !== item.controller.length ||
      item.recovery_target_states.some((state) => !ctx.states.has(state))) {
    return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL");
  }
  const controller = new Map(item.controller.map((entry) => [entry.state_id, ctx.transitions.get(entry.transition_id)]));
  if (disturbances.some((transition) => !transition || transition.kind !== "DISTURBANCE") ||
      disturbances.some((transition) => !ctx.states.has(transition.from) || !ctx.states.has(transition.to)) ||
      [...controller.entries()].some(([state, transition]) => !transition || transition.kind !== "CONTROL" || transition.from !== state)) {
    return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL");
  }

  let frontier = new Set([item.initial_state]);
  const visited = new Set(frontier);
  let transitionCount = 0;
  for (let depth = 1; depth <= item.horizon; depth += 1) {
    const next = new Set();
    for (const stateId of frontier) {
      const applicable = disturbances.filter((transition) => transition.from === stateId);
      const disturbedStates = [stateId, ...applicable.map((transition) => transition.to)];
      transitionCount += applicable.length;
      for (const disturbedState of disturbedStates) {
        visited.add(disturbedState);
        if (boundExceeded({ states: visited.size, transitions: transitionCount }, item.traversal_limits, depth)) {
          return result("UNKNOWN", "TRAVERSAL_BOUND_REACHED");
        }
        const disturbedDefinition = ctx.states.get(disturbedState);
        if (!disturbedDefinition?.legal) return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL");
        if (!disturbedDefinition.safe || !disturbedDefinition.essential) return result("FAIL", "SURVIVAL_FALSIFIED");
        const control = controller.get(disturbedState);
        if (!control) return result("UNKNOWN", "CONTROLLER_UNDEFINED");
        const controlledState = control.to;
        transitionCount += 1;
        visited.add(controlledState);
        if (boundExceeded({ states: visited.size, transitions: transitionCount }, item.traversal_limits, depth)) {
          return result("UNKNOWN", "TRAVERSAL_BOUND_REACHED");
        }
        const controlledDefinition = ctx.states.get(controlledState);
        if (!controlledDefinition?.legal) return result("UNKNOWN", "INVALID_SURVIVABILITY_MODEL");
        if (!controlledDefinition.safe || !controlledDefinition.essential) return result("FAIL", "SURVIVAL_FALSIFIED");
        next.add(controlledState);
      }
    }
    frontier = next;
  }
  if ([...frontier].some((state) => !item.recovery_target_states.includes(state))) return result("UNKNOWN", "RECOVERY_NOT_PROVEN");
  return result("PASS", "SURVIVAL_PROVEN_BOUNDED");
}

function withinBudget(cost, budget) {
  return Object.keys(budget).every((field) => cost[field] <= budget[field]);
}

function compareCosts(left, right, priority) {
  for (const field of priority) {
    const difference = left.resource_bound[field] - right.resource_bound[field];
    if (difference !== 0) return difference;
  }
  return left.instrument_id.localeCompare(right.instrument_id);
}

export function analyzeEconomyCase(fixture, item) {
  const ctx = context(fixture);
  const decisive = item.current_evidence.some((evidence) => evidence.check_id === item.required_check_id &&
    evidence.fresh && new Set(["PASS", "FAIL"]).has(evidence.result));
  if (decisive) return result("PASS", "EVIDENCE_ALREADY_DECISIVE", { selected_instrument_id: null });

  const initial = ctx.states.get(item.initial_state);
  if (!initial?.legal) return result("UNKNOWN", "INVALID_ECONOMY_STATE", { selected_instrument_id: null });
  const assessmentIds = item.instrument_assessments.map((entry) => entry.instrument_id);
  if (new Set(assessmentIds).size !== assessmentIds.length ||
      new Set(assessmentIds).size !== item.candidate_instrument_ids.length ||
      item.candidate_instrument_ids.some((id) => !assessmentIds.includes(id))) {
    return result("UNKNOWN", "INVALID_ELIGIBILITY_EVIDENCE", { selected_instrument_id: null });
  }
  const assessments = new Map(item.instrument_assessments.map((entry) => [entry.instrument_id, entry]));
  const candidates = item.candidate_instrument_ids.map((id) => ctx.instruments.get(id)).filter(Boolean);
  const measuring = candidates.filter((instrument) => ctx.measurementMap.get(instrument.instrument_id)?.has(item.required_check_id));
  if (measuring.length === 0) return result("UNKNOWN", "NO_MEASURING_INSTRUMENT", { selected_instrument_id: null });
  const authorized = measuring.filter((instrument) => item.authorized_consequence_classes.includes(instrument.consequence_class));
  if (authorized.length === 0) return result("UNKNOWN", "NO_AUTHORIZED_INSTRUMENT", { selected_instrument_id: null });
  if (authorized.some((instrument) => instrument.resource_bound.egress_bytes > instrument.privacy.max_egress_bytes ||
      (instrument.resource_bound.egress_bytes > 0 && !instrument.privacy.egress_allowed))) {
    return result("UNKNOWN", "INSTRUMENT_PRIVACY_CONTRACT_INVALID", { selected_instrument_id: null });
  }
  const compatible = authorized.filter((instrument) => {
    const assessment = assessments.get(instrument.instrument_id);
    if (instrument.subject_type !== fixture.profile.subject_type || !instrument.allowed_states.includes(item.initial_state)) return false;
    if (assessment.guard_status !== "PASS" || assessment.observability_status !== "PASS") return false;
    if (instrument.authority_required && assessment.authority_status !== "PASS") return false;
    if (!instrument.authority_required && !new Set(["PASS", "NOT_REQUIRED"]).has(assessment.authority_status)) return false;
    if (instrument.consequence_class !== "READ_ONLY" && assessment.recoverability_status !== "PASS") return false;
    if (instrument.consequence_class === "READ_ONLY" && !new Set(["PASS", "NOT_REQUIRED"]).has(assessment.recoverability_status)) return false;
    return instrument.resource_bound.egress_bytes === 0 ||
      (instrument.privacy.egress_allowed && instrument.resource_bound.egress_bytes <= instrument.privacy.max_egress_bytes);
  });
  if (compatible.length === 0) {
    const unresolved = authorized.some((instrument) => {
      const assessment = assessments.get(instrument.instrument_id);
      return [assessment.guard_status, assessment.authority_status, assessment.observability_status, assessment.recoverability_status].includes("UNKNOWN");
    });
    return result("UNKNOWN", unresolved ? "COMPATIBILITY_UNRESOLVED" : "NO_COMPATIBLE_INSTRUMENT", { selected_instrument_id: null });
  }
  const affordable = compatible.filter((instrument) => withinBudget(instrument.resource_bound, item.budget));
  if (affordable.length === 0) return result("UNKNOWN", "RESOURCE_BOUND", { selected_instrument_id: null });
  affordable.sort((left, right) => compareCosts(left, right, fixture.resource_priority));
  return result("PASS", "LEAST_COST_INSTRUMENT_SELECTED", { selected_instrument_id: affordable[0].instrument_id });
}

export function evaluateFixture(fixture) {
  return {
    instrument_cases: fixture.instrument_cases.map((item) => ({ case_id: item.case_id, result: analyzeInstrumentCase(fixture, item) })),
    survivability_cases: fixture.survivability_cases.map((item) => ({ case_id: item.case_id, result: analyzeSurvivabilityCase(fixture, item) })),
    economy_cases: fixture.economy_cases.map((item) => ({ case_id: item.case_id, result: analyzeEconomyCase(fixture, item) }))
  };
}

export { canonical };
