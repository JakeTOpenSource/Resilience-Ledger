#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ledgerRoot = __dirname;
const repoRoot = path.resolve(ledgerRoot, '..', '..');
const eventsRoot = path.join(ledgerRoot, 'events');
const HASH = /^[0-9a-f]{64}$/;
const EVENT_ID = /^evt_[a-z0-9][a-z0-9_-]+$/;
const STREAM_ID = /^[a-z][a-z0-9_-]+$/;
const EVENT_TYPE = /^[a-z][a-z0-9_]+(\.[a-z][a-z0-9_]+)+$/;
const CONSEQUENCE = ['C0', 'C1', 'C2', 'C3'];
const DECISIONS = ['OBSERVE', 'ACCEPT', 'ACCEPT_WITH_LIMITS', 'DEFER', 'REJECT', 'SUPERSEDE', 'CORRECT'];
const AXES = {
  evidence: ['VERIFIED', 'UNVERIFIED', 'NOT_OBSERVED', 'NOT_APPLICABLE'],
  authority: ['AUTHORIZED', 'UNVERIFIED', 'NOT_REQUIRED', 'NOT_OBSERVED'],
  preparation: ['PASS', 'FAIL', 'UNKNOWN', 'NOT_APPLICABLE'],
  execution: ['PASS', 'FAIL', 'NOT_EXECUTED', 'UNKNOWN', 'NOT_APPLICABLE'],
  observation: ['OBSERVED', 'FAIL', 'NOT_OBSERVED', 'UNKNOWN', 'NOT_APPLICABLE'],
  acceptance: ['ACCEPT', 'ACCEPT_WITH_LIMITS', 'DEFER', 'REJECT', 'NOT_APPLICABLE'],
  outcome: ['PASS', 'FAIL', 'UNKNOWN', 'NOT_OBSERVED', 'NOT_APPLICABLE']
};
const EFFECTS = ['NONE', 'REPOSITORY_CHANGE', 'DEPLOYMENT', 'EXTERNAL_MESSAGE', 'DELETION'];
const REQUIRED = [
  'schema_version', 'event_id', 'stream_id', 'sequence', 'event_type', 'occurred_at',
  'recorded_at', 'actor', 'classification', 'consequence_class', 'parents',
  'prev_event_hash', 'payload_hash', 'event_hash', 'read_set', 'write_set',
  'precondition_refs', 'evidence_refs', 'authority_ref', 'idempotency_key',
  'decision', 'status_axes', 'effect', 'supersedes', 'correction_of', 'payload'
];

function canonicalize(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('canonical JSON refuses non-finite numbers');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + canonicalize(value[key])).join(',') + '}';
  }
  throw new Error(`canonical JSON refuses ${typeof value}`);
}

function sha256Bytes(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function hashValue(value) {
  return sha256Bytes(Buffer.from(canonicalize(value), 'utf8'));
}

function eventHash(event) {
  const material = {};
  for (const [key, value] of Object.entries(event)) if (key !== 'event_hash') material[key] = value;
  return hashValue(material);
}

function pretty(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

function jsonFiles(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  function walk(current) {
    for (const item of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(current, item.name);
      if (item.isDirectory()) walk(absolute);
      else if (item.isFile() && item.name.endsWith('.json')) out.push(absolute);
    }
  }
  walk(root);
  return out;
}

function loadJson(absolute) {
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

function loadEvents(root = eventsRoot) {
  return jsonFiles(root).map((absolute) => ({
    absolute,
    relative: path.relative(repoRoot, absolute).split(path.sep).join('/'),
    event: loadJson(absolute)
  }));
}

function isoOrNull(value) {
  return value === null || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) && !Number.isNaN(Date.parse(value)));
}

function uniqueStrings(value) {
  return Array.isArray(value) && value.every((x) => typeof x === 'string') && new Set(value).size === value.length;
}

function validateEvent(event) {
  const errors = [];
  const add = (condition, message) => { if (!condition) errors.push(message); };
  add(event && typeof event === 'object' && !Array.isArray(event), 'event must be an object');
  if (!event || typeof event !== 'object' || Array.isArray(event)) return errors;
  for (const key of REQUIRED) add(Object.prototype.hasOwnProperty.call(event, key), `missing field ${key}`);
  const extra = Object.keys(event).filter((key) => !REQUIRED.includes(key));
  add(extra.length === 0, `unknown fields: ${extra.join(', ')}`);
  add(event.schema_version === '1.0.0', 'schema_version must be 1.0.0');
  add(typeof event.event_id === 'string' && EVENT_ID.test(event.event_id), 'invalid event_id');
  add(typeof event.stream_id === 'string' && STREAM_ID.test(event.stream_id), 'invalid stream_id');
  add(Number.isInteger(event.sequence) && event.sequence >= 1, 'sequence must be a positive integer');
  add(typeof event.event_type === 'string' && EVENT_TYPE.test(event.event_type), 'invalid event_type');
  add(isoOrNull(event.occurred_at), 'occurred_at must be an ISO UTC date-time or null');
  add(event.recorded_at !== null && isoOrNull(event.recorded_at), 'recorded_at must be an ISO UTC date-time');
  add(event.actor && typeof event.actor === 'object' && !Array.isArray(event.actor), 'actor must be an object');
  if (event.actor && typeof event.actor === 'object') {
    add(Object.keys(event.actor).sort().join(',') === 'auth_basis,id,role', 'actor fields must be exactly id, role, auth_basis');
    for (const key of ['id', 'role', 'auth_basis']) add(typeof event.actor[key] === 'string' && event.actor[key].length > 0, `actor.${key} is required`);
  }
  add(['PUBLIC', 'INTERNAL', 'RESTRICTED'].includes(event.classification), 'invalid classification');
  add(CONSEQUENCE.includes(event.consequence_class), 'invalid consequence_class');
  for (const key of ['parents', 'read_set', 'write_set', 'precondition_refs', 'supersedes', 'correction_of']) {
    add(uniqueStrings(event[key]), `${key} must be an array of unique strings`);
  }
  for (const key of ['parents', 'supersedes', 'correction_of']) {
    if (Array.isArray(event[key])) for (const id of event[key]) add(EVENT_ID.test(id), `${key} contains invalid event id ${id}`);
  }
  add((event.sequence === 1 && event.prev_event_hash === '') || (event.sequence > 1 && HASH.test(event.prev_event_hash)),
    'prev_event_hash must be empty only for sequence 1');
  add(typeof event.payload === 'object' && event.payload !== null && !Array.isArray(event.payload), 'payload must be an object');
  if (event.payload && typeof event.payload === 'object') add(HASH.test(event.payload_hash) && event.payload_hash === hashValue(event.payload), 'payload_hash mismatch');
  add(HASH.test(event.event_hash) && event.event_hash === eventHash(event), 'event_hash mismatch');
  add(typeof event.idempotency_key === 'string' && event.idempotency_key.length > 0, 'idempotency_key is required');
  add(event.authority_ref === null || typeof event.authority_ref === 'string', 'authority_ref must be a string or null');
  add(DECISIONS.includes(event.decision), 'invalid decision');
  add(event.status_axes && typeof event.status_axes === 'object', 'status_axes must be an object');
  if (event.status_axes && typeof event.status_axes === 'object') {
    add(Object.keys(event.status_axes).sort().join(',') === Object.keys(AXES).sort().join(','), 'status_axes keys must be exact');
    for (const [axis, allowed] of Object.entries(AXES)) add(allowed.includes(event.status_axes[axis]), `invalid status_axes.${axis}`);
  }
  add(event.effect && typeof event.effect === 'object', 'effect must be an object');
  if (event.effect && typeof event.effect === 'object') {
    add(Object.keys(event.effect).sort().join(',') === 'kind,recovery_ref,reversible,target', 'effect fields must be exact');
    add(EFFECTS.includes(event.effect.kind), 'invalid effect.kind');
    add(event.effect.target === null || typeof event.effect.target === 'string', 'effect.target must be a string or null');
    add(typeof event.effect.reversible === 'boolean', 'effect.reversible must be boolean');
    add(event.effect.recovery_ref === null || typeof event.effect.recovery_ref === 'string', 'effect.recovery_ref must be a string or null');
    if (event.effect.kind === 'NONE') add(event.effect.target === null && event.effect.recovery_ref === null, 'NONE effect cannot have target or recovery_ref');
  }
  add(Array.isArray(event.evidence_refs), 'evidence_refs must be an array');
  if (Array.isArray(event.evidence_refs)) {
    for (const [index, ref] of event.evidence_refs.entries()) {
      add(ref && typeof ref === 'object' && !Array.isArray(ref), `evidence_refs[${index}] must be an object`);
      if (!ref || typeof ref !== 'object') continue;
      add(Object.keys(ref).sort().join(',') === 'classification,kind,ref_id,sha256,source_locator', `evidence_refs[${index}] fields must be exact`);
      add(typeof ref.ref_id === 'string' && ref.ref_id.length > 0, `evidence_refs[${index}].ref_id required`);
      add(typeof ref.kind === 'string' && ref.kind.length > 0, `evidence_refs[${index}].kind required`);
      add(['PUBLIC', 'INTERNAL', 'RESTRICTED'].includes(ref.classification), `evidence_refs[${index}] invalid classification`);
      add(ref.sha256 === null || (typeof ref.sha256 === 'string' && HASH.test(ref.sha256)), `evidence_refs[${index}] invalid sha256`);
      add(ref.source_locator === null || typeof ref.source_locator === 'string', `evidence_refs[${index}] invalid source_locator`);
    }
  }
  return errors;
}

function verifyLedger(records) {
  const errors = [];
  const ids = new Map();
  const idempotency = new Map();
  for (const record of records) {
    for (const error of validateEvent(record.event)) errors.push(`${record.relative}: ${error}`);
    if (ids.has(record.event.event_id)) errors.push(`${record.relative}: duplicate event_id also in ${ids.get(record.event.event_id)}`);
    else ids.set(record.event.event_id, record.relative);
    if (idempotency.has(record.event.idempotency_key)) errors.push(`${record.relative}: duplicate idempotency_key also in ${idempotency.get(record.event.idempotency_key)}`);
    else idempotency.set(record.event.idempotency_key, record.relative);
  }
  const streams = new Map();
  for (const record of records) {
    if (!streams.has(record.event.stream_id)) streams.set(record.event.stream_id, []);
    streams.get(record.event.stream_id).push(record);
  }
  for (const [stream, entries] of streams) {
    entries.sort((a, b) => a.event.sequence - b.event.sequence || a.event.event_id.localeCompare(b.event.event_id));
    let previous = '';
    for (let index = 0; index < entries.length; index++) {
      const record = entries[index];
      const expectedSequence = index + 1;
      if (record.event.sequence !== expectedSequence) errors.push(`${record.relative}: ${stream} expected sequence ${expectedSequence}`);
      if (record.event.prev_event_hash !== previous) errors.push(`${record.relative}: ${stream} prev_event_hash does not match sequence ${index}`);
      previous = record.event.event_hash;
    }
  }
  for (const record of records) {
    for (const field of ['parents', 'supersedes', 'correction_of']) {
      for (const id of record.event[field] || []) if (!ids.has(id)) errors.push(`${record.relative}: ${field} references unknown ${id}`);
    }
  }
  return { ok: errors.length === 0, errors, streams, ids };
}

function replay(records) {
  const verified = verifyLedger(records);
  if (!verified.ok) throw new Error(verified.errors.join('\n'));
  const projections = {};
  const owners = {};
  const ordered = [...records].sort((a, b) => a.event.recorded_at.localeCompare(b.event.recorded_at) || a.event.event_id.localeCompare(b.event.event_id));
  for (const { event, relative } of ordered) {
    const projection = event.payload && event.payload.projection;
    if (!projection) continue;
    if (!projection.path || typeof projection.record !== 'object') throw new Error(`${relative}: invalid projection instruction`);
    if (!/^governance\/(?:authority-map\.json|artifact-register\.json|external-feedback\.json|deployment-receipts\/[a-z0-9._-]+\.json)$/.test(projection.path)) {
      throw new Error(`${relative}: projection path is outside the allowlist`);
    }
    if (owners[projection.path] && owners[projection.path] !== event.stream_id) throw new Error(`${relative}: projection path has multiple owning streams`);
    owners[projection.path] = event.stream_id;
    projections[projection.path] = projection.record;
  }
  return projections;
}

function projectionRoot(projections) {
  return hashValue(projections);
}

module.exports = {
  AXES,
  CONSEQUENCE,
  EFFECTS,
  eventsRoot,
  ledgerRoot,
  repoRoot,
  canonicalize,
  eventHash,
  hashValue,
  jsonFiles,
  loadEvents,
  loadJson,
  pretty,
  projectionRoot,
  replay,
  sha256Bytes,
  validateEvent,
  verifyLedger
};
