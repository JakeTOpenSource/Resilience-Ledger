function canonical(value) {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
}

function permutations(items) {
  if (items.length <= 1) return [items];
  const result = [];
  for (let index = 0; index < items.length; index += 1) {
    const head = items[index];
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    for (const tail of permutations(rest)) result.push([head, ...tail]);
  }
  return result;
}

function combinations(items, size) {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [head, ...tail] = items;
  return [
    ...combinations(tail, size - 1).map((rest) => [head, ...rest]),
    ...combinations(tail, size)
  ];
}

function sameSet(left, right) {
  return canonical([...left].sort()) === canonical([...right].sort());
}

function validateDelta(profile, delta) {
  if (delta.subject_id !== profile.subject_id || delta.policy_id !== profile.policy_id || delta.policy_generation !== profile.policy_generation) {
    return "POLICY_BINDING_MISMATCH";
  }
  if (!sameSet(delta.causal_parents, profile.causal_frontier)) return "CAUSAL_FRONTIER_MISMATCH";
  return null;
}

function predicateHolds(values, predicate) {
  const present = Object.prototype.hasOwnProperty.call(values, predicate.field);
  const actual = values[predicate.field];
  if (predicate.operator === "EXISTS") return present === predicate.value;
  if (!present) return false;
  if (predicate.operator === "EQ") return canonical(actual) === canonical(predicate.value);
  if (predicate.operator === "NE") return canonical(actual) !== canonical(predicate.value);
  if (typeof actual !== "number" || typeof predicate.value !== "number") return false;
  if (predicate.operator === "LT") return actual < predicate.value;
  if (predicate.operator === "LTE") return actual <= predicate.value;
  if (predicate.operator === "GT") return actual > predicate.value;
  if (predicate.operator === "GTE") return actual >= predicate.value;
  return false;
}

function predicatesHold(values, delta) {
  return (delta.predicate_reads ?? []).every((predicate) => predicateHolds(values, predicate));
}

function runSchedule(profile, baseState, schedule) {
  const values = structuredClone(baseState.values ?? {});
  const accepted = [];
  const refused = [];
  const effectTrace = [];
  for (const delta of schedule) {
    if (!predicatesHold(values, delta)) {
      refused.push(delta.delta_id);
      continue;
    }
    const candidate = structuredClone(values);
    for (const [key, value] of Object.entries(delta.writes ?? {})) candidate[key] = value;
    for (const [key, increment] of Object.entries(delta.increments ?? {})) candidate[key] = (candidate[key] ?? 0) + increment;
    const violated = Object.entries(profile.limits)
      .filter(([, limit]) => typeof limit === "number")
      .some(([key, limit]) => typeof candidate[key] === "number" && candidate[key] > limit);
    if (violated) {
      refused.push(delta.delta_id);
      continue;
    }
    Object.assign(values, candidate);
    accepted.push(delta.delta_id);
    for (const effect of delta.effects ?? []) effectTrace.push(effect.effect_id);
  }
  return {
    projection: { values, accepted: accepted.sort(), refused: refused.sort() },
    effect_trace: effectTrace
  };
}

function scheduleClasses(profile, baseState, deltas) {
  const runs = permutations(deltas).map((schedule) => runSchedule(profile, baseState, schedule));
  return {
    schedule_count: runs.length,
    projection_count: new Set(runs.map((run) => canonical(run.projection))).size,
    effect_count: new Set(runs.map((run) => canonical(run.effect_trace))).size
  };
}

export function analyzeBatch(profile, item) {
  if (item.termination_evidence !== "FINITE_ENUMERATION") {
    return { status: "UNKNOWN", reason_code: "TERMINATION_NOT_PROVEN", schedule_count: 0, pairwise_all_commute: false };
  }
  for (const delta of item.deltas) {
    const rejection = validateDelta(profile, delta);
    if (rejection) return { status: "FAIL", reason_code: rejection, schedule_count: 0, pairwise_all_commute: false };
  }
  if (item.deltas.some((delta) => !predicatesHold(item.base_state.values ?? {}, delta))) {
    return { status: "FAIL", reason_code: "PRECONDITION_FAILED", schedule_count: 0, pairwise_all_commute: false };
  }
  const full = scheduleClasses(profile, item.base_state, item.deltas);
  const pairs = combinations(item.deltas, 2);
  const pairwiseAllCommute = pairs.every((pair) => {
    const analysis = scheduleClasses(profile, item.base_state, pair);
    return analysis.projection_count === 1 && analysis.effect_count === 1;
  });
  if (full.projection_count > 1) {
    return {
      status: "FAIL",
      reason_code: item.deltas.length > 2 && pairwiseAllCommute ? "PAIRWISE_INSUFFICIENT" : "ORDER_REQUIRED",
      schedule_count: full.schedule_count,
      pairwise_all_commute: pairwiseAllCommute
    };
  }
  if (full.effect_count > 1) {
    return { status: "FAIL", reason_code: "EFFECT_ORDER_REQUIRED", schedule_count: full.schedule_count, pairwise_all_commute: false };
  }
  return { status: "PASS", reason_code: "COMMUTES", schedule_count: full.schedule_count, pairwise_all_commute: pairwiseAllCommute };
}

export function analyzeEffect(profile, item) {
  let status = "UNKNOWN";
  let reasonCode = "NO_EVENT";
  let effectCount = 0;
  const effects = new Map();
  const keys = new Map();
  for (let index = 0; index < item.events.length; index += 1) {
    const event = item.events[index];
    const expectedSequence = index + 1;
    const expectedPrevious = index === 0 ? null : index;
    if (event.sequence !== expectedSequence || event.previous_sequence !== expectedPrevious) {
      return { status: "FAIL", reason_code: "NONCONTIGUOUS_EFFECT_SEQUENCE", effect_count: effectCount };
    }
    if (event.type !== "OBSERVE" && event.policy_generation !== profile.policy_generation) {
      return { status: "FAIL", reason_code: "POLICY_BINDING_MISMATCH", effect_count: effectCount };
    }
    const keyOwner = keys.get(event.idempotency_key);
    if (keyOwner !== undefined && keyOwner !== event.effect_id) {
      return { status: "FAIL", reason_code: "EFFECT_ID_MISMATCH", effect_count: effectCount };
    }
    let effect = effects.get(event.effect_id);
    if (!effect && event.type !== "PREPARE") {
      return {
        status: "FAIL",
        reason_code: effects.size > 0 ? "EFFECT_ID_MISMATCH" : "ILLEGAL_EFFECT_TRANSITION",
        effect_count: effectCount
      };
    }
    if (event.type === "PREPARE") {
      if (effect) return { status: "FAIL", reason_code: "ILLEGAL_EFFECT_TRANSITION", effect_count: effectCount };
      effect = { state: "PREPARED", idempotency_key: event.idempotency_key, dispatch_step: null, duplicate_pending: false, outcomes: new Set() };
      effects.set(event.effect_id, effect);
      keys.set(event.idempotency_key, event.effect_id);
      status = "UNKNOWN";
      reasonCode = "PREPARED_NOT_FINAL";
    } else if (effect.idempotency_key !== event.idempotency_key) {
      return { status: "FAIL", reason_code: "EFFECT_ID_MISMATCH", effect_count: effectCount };
    } else if (event.type === "DISPATCH") {
      if (effect.state === "PREPARED") {
        effect.state = "DISPATCHED";
        effect.dispatch_step = event.effect_step;
        effectCount += 1;
        status = "UNKNOWN";
        reasonCode = "DISPATCHED_NOT_FINAL";
      } else if (effect.state === "DISPATCHED") {
        if (event.effect_step - effect.dispatch_step <= profile.effect_policy.dedupe_retention_steps) {
          effect.duplicate_pending = true;
          status = "UNKNOWN";
          reasonCode = "DUPLICATE_SUPPRESSION_UNVERIFIED";
        } else {
          effectCount += 1;
          effect.state = "DUPLICATE_RISK";
          status = "FAIL";
          reasonCode = "DUPLICATE_RISK";
        }
      } else {
        return { status: "FAIL", reason_code: "ILLEGAL_EFFECT_TRANSITION", effect_count: effectCount };
      }
    } else if (event.type === "DEDUPE_CONFIRM") {
      if (effect.state !== "DISPATCHED" || !effect.duplicate_pending) {
        return { status: "FAIL", reason_code: "ILLEGAL_EFFECT_TRANSITION", effect_count: effectCount };
      }
      effect.duplicate_pending = false;
      status = "PASS";
      reasonCode = "DUPLICATE_DEDUPED";
    } else if (event.type === "TIMEOUT") {
      if (effect.state !== "DISPATCHED") return { status: "FAIL", reason_code: "ILLEGAL_EFFECT_TRANSITION", effect_count: effectCount };
      effect.state = "EFFECT_UNKNOWN";
      status = "UNKNOWN";
      reasonCode = "EFFECT_UNKNOWN";
    } else if (event.type === "OBSERVE") {
      if (!new Set(["DISPATCHED", "EFFECT_UNKNOWN", "OBSERVED"]).has(effect.state)) {
        return { status: "FAIL", reason_code: "ILLEGAL_EFFECT_TRANSITION", effect_count: effectCount };
      }
      if (event.policy_generation !== profile.policy_generation) {
        effect.state = "OBSERVATION_STALE";
        status = "UNKNOWN";
        reasonCode = "OBSERVATION_STALE";
      } else {
        effect.outcomes.add(event.outcome);
        if (effect.outcomes.size > 1) {
          effect.state = "OBSERVATION_CONFLICT";
          status = "UNKNOWN";
          reasonCode = "OBSERVATION_CONFLICT";
        } else {
          effect.state = "OBSERVED";
          status = "UNKNOWN";
          reasonCode = "OBSERVED_NOT_SETTLED";
        }
      }
    } else if (event.type === "SETTLE") {
      if (effect.state !== "OBSERVED") return { status: "FAIL", reason_code: "ILLEGAL_EFFECT_TRANSITION", effect_count: effectCount };
      effect.state = "SETTLED";
      status = "PASS";
      reasonCode = "SETTLED";
    } else if (event.type === "REVOKE") {
      if (effect.state === "PREPARED") {
        effect.state = "REFUSED";
        status = "FAIL";
        reasonCode = "AUTHORITY_REVOKED_BEFORE_DISPATCH";
      } else if (new Set(["DISPATCHED", "EFFECT_UNKNOWN", "OBSERVED"]).has(effect.state)) {
        effect.state = "EFFECT_UNKNOWN";
        status = "UNKNOWN";
        reasonCode = "AUTHORITY_REVOKED_AFTER_DISPATCH";
      } else {
        return { status: "FAIL", reason_code: "ILLEGAL_EFFECT_TRANSITION", effect_count: effectCount };
      }
    }
  }
  return { status, reason_code: reasonCode, effect_count: effectCount };
}

export function analyzeCapacity(profile, item) {
  if (item.unit !== profile.limits.capacity_unit) return { status: "FAIL", reason_code: "CAPACITY_UNIT_MISMATCH", max_backlog: null };
  const lanes = ["observation", "settlement", "recovery"];
  const lengths = lanes.flatMap((lane) => [item.arrivals?.[lane]?.length, item.service?.[lane]?.length]);
  if (lengths.some((length) => !Number.isInteger(length)) || new Set(lengths).size !== 1 || lengths[0] < 1) {
    return { status: "FAIL", reason_code: "CAPACITY_SHAPE_MISMATCH", max_backlog: null };
  }
  const numericValues = [
    ...lanes.map((lane) => item.initial[lane]),
    ...lanes.map((lane) => profile.limits.buffers[lane]),
    ...lanes.flatMap((lane) => item.arrivals[lane]),
    ...lanes.flatMap((lane) => item.service[lane])
  ];
  if (numericValues.some((value) => !Number.isFinite(value) || value < 0)) {
    return { status: "FAIL", reason_code: "CAPACITY_VALUE_INVALID", max_backlog: null };
  }
  const backlog = structuredClone(item.initial);
  const maxima = structuredClone(item.initial);
  let exceeded = false;
  for (let step = 0; step < lengths[0]; step += 1) {
    for (const lane of lanes) {
      backlog[lane] = Math.max(0, backlog[lane] + item.arrivals[lane][step] - item.service[lane][step]);
      maxima[lane] = Math.max(maxima[lane], backlog[lane]);
      if (backlog[lane] > profile.limits.buffers[lane]) exceeded = true;
    }
  }
  return { status: exceeded ? "FAIL" : "PASS", reason_code: exceeded ? "CAPACITY_EXCEEDED" : "CAPACITY_WITHIN_BOUNDS", max_backlog: maxima };
}

export function evaluateFixture(fixture) {
  return {
    batch_cases: fixture.batch_cases.map((item) => ({ case_id: item.case_id, result: analyzeBatch(fixture.profile, item) })),
    effect_cases: fixture.effect_cases.map((item) => ({ case_id: item.case_id, result: analyzeEffect(fixture.profile, item) })),
    capacity_cases: fixture.capacity_cases.map((item) => ({ case_id: item.case_id, result: analyzeCapacity(fixture.profile, item) }))
  };
}

export { canonical };
