#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = path.resolve(__dirname, '..');
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  const absolute = path.join(repoRoot, relativePath);
  try {
    return JSON.parse(fs.readFileSync(absolute, 'utf8'));
  } catch (error) {
    fail(`${relativePath}: ${error.message}`);
    return null;
  }
}

function sha256Bytes(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function canonicalRepositoryText(bytes) {
  return Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
}

function sha256RepositoryText(relativePath) {
  return sha256Bytes(canonicalRepositoryText(fs.readFileSync(path.join(repoRoot, relativePath))));
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function scanPublicRecord(relativePath, value) {
  const serialized = JSON.stringify(value);
  assert(!/[A-Za-z]:\\\\/.test(serialized), `${relativePath}: contains an absolute Windows path`);
  assert(!/file:\/\//i.test(serialized), `${relativePath}: contains a file URI`);

  const forbiddenKeys = new Set(['account_id', 'local_path', 'private_path', 'secret', 'token']);
  function walk(node, trail) {
    if (Array.isArray(node)) return node.forEach((item, index) => walk(item, `${trail}[${index}]`));
    if (!node || typeof node !== 'object') return;
    for (const [key, child] of Object.entries(node)) {
      assert(!forbiddenKeys.has(key.toLowerCase()), `${relativePath}: forbidden public key ${trail}.${key}`);
      walk(child, `${trail}.${key}`);
    }
  }
  walk(value, '$');
}

const authority = readJson('governance/authority-map.json');
const artifacts = readJson('governance/artifact-register.json');
const deployment = readJson('governance/deployment-receipts/2026-08-11-current-production.json');
const feedback = readJson('governance/external-feedback.json');
const vocabulary = readJson('governance/status-vocabulary-contract.json');

for (const [relativePath, record] of [
  ['governance/authority-map.json', authority],
  ['governance/artifact-register.json', artifacts],
  ['governance/deployment-receipts/2026-08-11-current-production.json', deployment],
  ['governance/external-feedback.json', feedback],
  ['governance/status-vocabulary-contract.json', vocabulary]
]) {
  if (record) scanPublicRecord(relativePath, record);
}

if (authority) {
  assert(authority.schema_version === '0.2.0', 'authority map: unexpected schema version');
  assert(authority.decision === 'ACCEPT_WITH_LIMITS', 'authority map: decision must preserve current limits');
  const scopeNames = authority.scopes.map((entry) => entry.scope);
  assert(new Set(scopeNames).size === scopeNames.length, 'authority map: scopes must be unique');
  for (const required of [
    'public_delta_atlas_source',
    'transition_method',
    'calibration_ledger_reference',
    'observed_production_state',
    'private_archive',
    'agent_or_ci_adapter',
    'public_research_metadata'
  ]) {
    assert(scopeNames.includes(required), `authority map: missing scope ${required}`);
  }
  const ledgerScope = authority.scopes.find((entry) => entry.scope === 'calibration_ledger_reference');
  assert(ledgerScope && ledgerScope.status === 'DEFER' && ledgerScope.authority === null,
    'authority map: unresolved ledger must remain deferred without an authority');
  const archiveScope = authority.scopes.find((entry) => entry.scope === 'private_archive');
  assert(archiveScope && archiveScope.status === 'FROZEN_NON_AUTHORITATIVE',
    'authority map: private archive must remain frozen and non-authoritative');
  const publicMetadata = authority.scopes.find((entry) => entry.scope === 'public_research_metadata');
  assert(publicMetadata && publicMetadata.status === 'ACCEPT_WITH_LIMITS' &&
    publicMetadata.authority === 'governance/decision-log/0002-public-metadata-release-acceptance.md',
  'authority map: public research metadata requires the scoped owner decision');
  assert(Array.isArray(authority.supplemental_decision_refs) &&
    authority.supplemental_decision_refs.includes('governance/decision-log/0002-public-metadata-release-acceptance.md'),
  'authority map: owner metadata decision is not linked');
}

if (artifacts) {
  assert(artifacts.hash_algorithm === 'SHA-256', 'artifact register: hash algorithm must be SHA-256');
  const hashPattern = /^[0-9a-f]{64}$/;
  for (const artifact of artifacts.artifacts || []) {
    assert(hashPattern.test(artifact.sha256), `artifact register: invalid hash for ${artifact.artifact_id}`);
    assert(['PUBLIC', 'INTERNAL', 'RESTRICTED'].includes(artifact.classification),
      `artifact register: invalid classification for ${artifact.artifact_id}`);
  }
  const claim = (artifacts.claims || []).find((item) => item.claim_id === 'stp-v1.1-calibration-ledger-v8-pin');
  const attached = (artifacts.artifacts || []).find((item) => item.artifact_id === 'calibration-ledger-v8-attached-docx');
  assert(claim && claim.relation_status === 'UNVERIFIED' && claim.decision === 'DEFER',
    'artifact register: ledger pin must remain UNVERIFIED and DEFERRED');
  assert(claim && attached && claim.asserted_sha256 !== attached.sha256,
    'artifact register: mismatch evidence must remain explicit');
  assert(artifacts.bounded_search_evidence.files_hashed === 452,
    'artifact register: bounded search file count changed without a new record');
  assert(artifacts.bounded_search_evidence.exact_matches_for_asserted_hash === 0,
    'artifact register: a matching artifact requires a superseding decision');
}

if (deployment) {
  assert(deployment.provider.source_type === null, 'deployment receipt: source type must reflect the observed null value');
  assert(deployment.deployment.trigger_type === 'ad_hoc', 'deployment receipt: expected observed ad hoc trigger');
  assert(deployment.deployment.reported_commit_hash === '', 'deployment receipt: provider did not report a commit hash');
  assert(deployment.deployment.source_commit_relationship === 'UNKNOWN',
    'deployment receipt: source relationship must remain UNKNOWN');
  assert(new Date(deployment.repository.commit_time) > new Date(deployment.deployment.modified_at),
    'deployment receipt: expected current main commit to post-date the observed deployment');
  assert(deployment.comparison.deployable_paths_checked === 102 && deployment.comparison.http_200 === 102,
    'deployment receipt: path totals do not match the recorded audit');
  assert(deployment.comparison.semantic_matches === 100 && deployment.comparison.semantic_mismatches === 2,
    'deployment receipt: semantic comparison totals are inconsistent');
  assert(deployment.comparison.semantic_matches + deployment.comparison.semantic_mismatches ===
    deployment.comparison.deployable_paths_checked,
    'deployment receipt: semantic totals must cover every checked path');
  assert(deployment.comparison.repository_hash_algorithm === 'SHA-256',
    'deployment receipt: repository hash algorithm must be SHA-256');
  assert(deployment.comparison.repository_hash_basis ===
    'UTF-8 repository text with CRLF normalized to LF, matching the committed Git blob bytes for the recorded files.',
    'deployment receipt: repository hash basis must stay explicit');
  assert(sha256Bytes(canonicalRepositoryText(Buffer.from('line one\r\nline two\r\n'))) ===
    sha256Bytes(canonicalRepositoryText(Buffer.from('line one\nline two\n'))),
    'deployment receipt: CRLF/LF portability regression');
  const mismatchByPath = Object.fromEntries(deployment.comparison.mismatches.map((item) => [item.path, item]));
  for (const required of ['index.html', 'sw.js']) {
    assert(Boolean(mismatchByPath[required]), `deployment receipt: missing drift record for ${required}`);
    if (mismatchByPath[required]) {
      assert(sha256RepositoryText(required) === mismatchByPath[required].repository_sha256,
        `deployment receipt: repository hash drifted for ${required}; add a new receipt`);
    }
  }
  const statusKeys = ['evidence', 'authority', 'preparation', 'execution', 'observation', 'acceptance', 'outcome'];
  for (const key of statusKeys) assert(typeof deployment.statuses[key] === 'string', `deployment receipt: missing status ${key}`);
  assert(deployment.statuses.observation === 'FAIL' && deployment.statuses.acceptance === 'DEFER',
    'deployment receipt: observed drift must not be accepted');
}

if (feedback) {
  assert(feedback.schema_version === '0.1.0', 'feedback register: unexpected schema version');
  assert(Array.isArray(feedback.observations) && feedback.observations.length === 1,
    'feedback register: expected one scoped observation');
  const observation = feedback.observations && feedback.observations[0];
  assert(observation && observation.independent_validation === 'NOT_OBSERVED',
    'feedback register: comment must not be promoted to independent validation');
  assert(observation && observation.methodological_review === 'NOT_OBSERVED',
    'feedback register: comment must not be promoted to methodological review');
  assert(observation && observation.endorsement === 'NOT_OBSERVED',
    'feedback register: comment must not be promoted to endorsement');
}

if (vocabulary) {
  assert(vocabulary.schema_version === '0.1.0', 'status vocabulary: unexpected schema version');
  assert(vocabulary.decision === 'DEFER', 'status vocabulary: semantic migration must remain deferred');
  const legacy = vocabulary.vocabularies && vocabulary.vocabularies['delta-atlas-legacy-adapter-v1'];
  const stp = vocabulary.vocabularies && vocabulary.vocabularies['stp-v1.1-status-axes'];
  assert(legacy && legacy.status === 'FROZEN_LEGACY' && legacy.relationship_to_stp_v1_1 === 'UNKNOWN',
    'status vocabulary: legacy adapter must remain frozen with UNKNOWN STP relation');
  assert(stp && stp.status === 'LITERAL_TOKENS_PINNED_SEMANTICS_INCOMPLETE',
    'status vocabulary: literal STP tokens must not imply complete semantics');
  assert(stp && JSON.stringify(stp.axes.evidence) === JSON.stringify(['SUPPORTED', 'CONTRADICTED', 'UNRESOLVED', 'UNAVAILABLE', 'INVALID']),
    'status vocabulary: STP evidence tokens drifted');
  assert(stp && JSON.stringify(stp.axes.authority) === JSON.stringify(['APPROVED', 'DENIED', 'DEFERRED', 'ESCALATED', 'REVOKED', 'NOT_REQUIRED']),
    'status vocabulary: STP authority tokens drifted');
  assert(stp && JSON.stringify(stp.axes.preparation) === JSON.stringify(['READY', 'BLOCKED', 'STALE', 'CONFLICT', 'EXPIRED']),
    'status vocabulary: STP preparation tokens drifted');
  assert(stp && JSON.stringify(stp.axes.execution) === JSON.stringify(['NOT_ATTEMPTED', 'APPLIED', 'PARTIAL', 'FAILED', 'REVERSED']),
    'status vocabulary: STP execution tokens drifted');
  assert(stp && JSON.stringify(stp.axes.observation) === JSON.stringify(['MATCHED', 'MISMATCHED', 'UNAVAILABLE', 'INVALID']),
    'status vocabulary: STP observation tokens drifted');
  assert(stp && JSON.stringify(stp.axes.acceptance) === JSON.stringify(['ACCEPTED', 'PRESERVED', 'PROVISIONAL', 'CONTESTED', 'SUPERSEDED', 'EXPIRED']),
    'status vocabulary: STP acceptance tokens drifted');
  assert(stp && JSON.stringify(stp.axes.outcome) === JSON.stringify(['MET', 'NOT_MET', 'MIXED', 'TOO_EARLY', 'UNMEASURED']),
    'status vocabulary: STP outcome tokens drifted');
  for (const relation of vocabulary.relations || []) {
    assert(['ALIAS', 'OVERLAP', 'RELATED', 'CONTESTED', 'UNKNOWN'].includes(relation.relation),
      `status vocabulary: invalid relation ${relation.relation}`);
    assert(relation.relation !== 'ALIAS', 'status vocabulary: no cross-vocabulary alias has been proven');
  }
}

for (const relativePath of [
  'governance/README.md',
  'governance/data-classification.md',
  'governance/decision-log/0001-work-packet-0-authority-freeze.md',
  'governance/decision-log/0002-public-metadata-release-acceptance.md',
  'governance/decision-log/0003-stp-status-vocabulary-boundary.md'
]) {
  assert(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath}: missing required governance document`);
}

if (failures.length) {
  console.error('Governance records RED');
  for (const message of failures) console.error(`FAIL  ${message}`);
  process.exit(1);
}

console.log('Governance records GREEN');
console.log(`authority scopes: ${authority.scopes.length}`);
console.log('research artifacts: 2; unresolved pins: 1');
console.log('external feedback: 1 observation; independent validations: 0');
console.log('status vocabularies: legacy frozen; STP literals pinned; semantic migration deferred');
console.log('recorded production observation: 102 paths; 100 semantic matches; 2 deferred mismatches');
