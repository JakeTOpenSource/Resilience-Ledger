#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('./lib.js');

const id = process.argv[2];
const recordedAt = process.argv[3];
if (!/^checkpoint-\d{6}$/.test(id || '') || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(recordedAt || '')) {
  console.error('usage: node governance/ledger/seal-checkpoint.js checkpoint-NNNNNN YYYY-MM-DDTHH:MM:SSZ');
  process.exit(2);
}
const records = L.loadEvents();
const verified = L.verifyLedger(records);
if (!verified.ok) throw new Error(verified.errors.join('\n'));
const existing = L.jsonFiles(path.join(L.ledgerRoot, 'checkpoints'));
let previous = '';
if (existing.length) previous = L.loadJson(existing[existing.length - 1]).checkpoint_root;
const eventFiles = {};
for (const record of records.sort((a, b) => a.relative.localeCompare(b.relative))) {
  eventFiles[record.relative] = L.sha256CanonicalTextBytes(fs.readFileSync(record.absolute));
}
const streams = {};
for (const [stream, entries] of verified.streams) {
  const head = entries[entries.length - 1].event;
  streams[stream] = { sequence: head.sequence, event_id: head.event_id, event_hash: head.event_hash };
}
const policyRef = 'governance/ledger/policy/capabilities.v1.json';
const policyPath = path.join(L.repoRoot, policyRef);
const checkpoint = {
  schema_version: '1.0.0',
  checkpoint_id: id,
  recorded_at: recordedAt,
  previous_checkpoint_root: previous,
  event_count: records.length,
  event_file_hash_basis: 'SHA-256 of UTF-8 event JSON with CRLF normalized to LF.',
  event_files: eventFiles,
  streams,
  capability_policy_ref: policyRef,
  capability_policy_sha256: L.sha256CanonicalTextBytes(fs.readFileSync(policyPath)),
  projection_root: L.projectionRoot(L.replay(records)),
  witnesses: [
    {
      kind: 'git_commit_or_release',
      status: 'NOT_OBSERVED',
      locator: null,
      limit: 'The checkpoint is internally sealed but has not yet been anchored by a protected signed ref or independent witness.'
    }
  ]
};
checkpoint.checkpoint_root = L.hashValue(checkpoint);
const target = path.join(L.ledgerRoot, 'checkpoints', `${id}.json`);
fs.writeFileSync(target, L.pretty(checkpoint), { encoding: 'utf8', flag: 'wx' });
console.log(`created ${path.relative(L.repoRoot, target).split(path.sep).join('/')}`);
console.log(checkpoint.checkpoint_root);
