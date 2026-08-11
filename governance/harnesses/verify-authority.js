#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

function validateAuthority(records = L.loadEvents()) {
  const errors = [];
  const ids = new Map(records.map((record) => [record.event.event_id, record]));
  const rank = { C0: 0, C1: 1, C2: 2, C3: 3 };
  const policyCache = new Map();
  const checkpointCoverage = new Map(records.map((record) => [record.relative, new Set()]));

  function policyEntries(checkpoint) {
    if (checkpoint.schema_version === '1.0.0') {
      return [[checkpoint.capability_policy_ref, checkpoint.capability_policy_sha256]];
    }
    return Object.entries(checkpoint.capability_policies || {});
  }

  for (const absolute of L.jsonFiles(path.join(L.ledgerRoot, 'checkpoints'))) {
    const checkpoint = L.loadJson(absolute);
    for (const [policyRef, digest] of policyEntries(checkpoint)) {
      const policyPath = path.join(L.repoRoot, policyRef || '');
      if (!/^governance\/ledger\/policy\/capabilities\.v\d+\.json$/.test(policyRef || '') ||
          !fs.existsSync(policyPath) || L.sha256CanonicalTextBytes(fs.readFileSync(policyPath)) !== digest) continue;
      for (const relative of Object.keys(checkpoint.event_files || {})) {
        if (checkpointCoverage.has(relative)) checkpointCoverage.get(relative).add(policyRef);
      }
    }
  }

  function loadPolicy(policyRef) {
    if (policyCache.has(policyRef)) return policyCache.get(policyRef);
    const policyPath = path.join(L.repoRoot, policyRef);
    if (!fs.existsSync(policyPath)) return null;
    const policy = L.loadJson(policyPath);
    policyCache.set(policyRef, policy);
    return policy;
  }

  function referenceExists(reference) {
    if (ids.has(reference)) return true;
    if (!/^governance\/decision-log\/[a-z0-9._-]+\.md$/.test(reference || '')) return false;
    return fs.existsSync(path.join(L.repoRoot, reference));
  }

  function pathReferenceDigestHolds(event, reference) {
    if (ids.has(reference)) return true;
    const evidence = (event.evidence_refs || []).find((item) => item.source_locator === reference && item.sha256);
    if (!evidence) return false;
    const absolute = path.join(L.repoRoot, reference);
    return fs.existsSync(absolute) && L.sha256CanonicalTextBytes(fs.readFileSync(absolute)) === evidence.sha256;
  }

  for (const { relative, event } of records) {
    const policyRef = event.capability_policy_ref || L.POLICY_BY_SCHEMA[event.schema_version];
    const policy = loadPolicy(policyRef);
    if (!policy) { errors.push(`${relative}: unresolved capability policy ${policyRef}`); continue; }
    if (!checkpointCoverage.get(relative) || !checkpointCoverage.get(relative).has(policyRef)) {
      errors.push(`${relative}: event is not sealed by a checkpoint that pins ${policyRef}`);
    }
    const role = policy.roles && policy.roles[event.actor.role];
    if (!role) { errors.push(`${relative}: unknown actor role ${event.actor.role}`); continue; }
    if (rank[event.consequence_class] > rank[role.max_consequence_class]) errors.push(`${relative}: role exceeds ${role.max_consequence_class}`);
    if (!role.event_types.includes('*') && !role.event_types.includes(event.event_type)) errors.push(`${relative}: role cannot emit ${event.event_type}`);
    if (!role.effect_kinds.includes(event.effect.kind)) errors.push(`${relative}: role cannot record effect ${event.effect.kind}`);
    if (rank[event.consequence_class] >= rank.C2 && !event.authority_ref) errors.push(`${relative}: C2/C3 event lacks authority_ref`);
    if (event.authority_ref && !referenceExists(event.authority_ref)) errors.push(`${relative}: authority_ref does not resolve: ${event.authority_ref}`);
    if (event.authority_ref && !pathReferenceDigestHolds(event, event.authority_ref)) {
      errors.push(`${relative}: authority_ref is not an event or a digest-pinned decision record: ${event.authority_ref}`);
    }
    if (event.schema_version === '2.0.0' && rank[event.consequence_class] >= rank.C2 && event.actor.auth_basis !== event.authority_ref) {
      errors.push(`${relative}: v2 C2/C3 actor.auth_basis must equal the resolved authority_ref`);
    }
    if (event.effect.kind !== 'NONE' &&
        (!referenceExists(event.effect.recovery_ref) || !pathReferenceDigestHolds(event, event.effect.recovery_ref))) {
      errors.push(`${relative}: recovery_ref is not an event or a digest-pinned decision record: ${event.effect.recovery_ref}`);
    }
    if (event.actor.role.startsWith('agent_') && ['ACCEPT', 'ACCEPTED'].includes(event.status_axes.acceptance)) {
      errors.push(`${relative}: agent adapter silently accepts state`);
    }
  }
  return errors;
}

function main() {
  const errors = validateAuthority();
  if (errors.length) H.fail('event capability matrix and reference resolution', errors);
  else H.pass('event roles, consequence ceilings, pinned policies, authority references, and recovery references hold');
  process.exit(H.summarize('AUTHORITY'));
}

if (require.main === module) main();
module.exports = { validateAuthority };
