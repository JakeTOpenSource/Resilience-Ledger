#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

const records = L.loadEvents();
const verdict = L.verifyLedger(records);
if (L.sha256CanonicalTextBytes(Buffer.from('one\r\ntwo\r\n')) ===
    L.sha256CanonicalTextBytes(Buffer.from('one\ntwo\n'))) {
  H.pass('checkpoint text hashes are CRLF/LF stable');
} else {
  H.fail('checkpoint text hash portability', 'CRLF and LF digests differ');
}
if (records.length) H.pass(`${records.length} immutable event files loaded`);
else H.fail('event inventory', 'no events found');
if (verdict.ok) H.pass(`${verdict.streams.size} stream chains and cross-references verify`);
else H.fail('event envelope and chain verification', verdict.errors);

const expectedPattern = /^governance\/ledger\/events\/([a-z][a-z0-9_-]+)\/(\d{6})-[a-z0-9][a-z0-9_-]+\.json$/;
const namingErrors = [];
for (const record of records) {
  const match = expectedPattern.exec(record.relative);
  if (!match) namingErrors.push(`${record.relative}: invalid event path`);
  else if (Number(match[2]) !== record.event.sequence) namingErrors.push(`${record.relative}: filename sequence differs from envelope`);
  else if (match[1] !== record.event.stream_id) namingErrors.push(`${record.relative}: directory differs from stream_id`);
}
if (namingErrors.length) H.fail('event path convention', namingErrors);
else H.pass('event paths bind stream and zero-padded sequence');

const checkpointDir = path.join(L.ledgerRoot, 'checkpoints');
const checkpoints = L.jsonFiles(checkpointDir);
const checkpointErrors = [];
let previousRoot = '';
for (const absolute of checkpoints) {
  const checkpoint = L.loadJson(absolute);
  const material = { ...checkpoint };
  delete material.checkpoint_root;
  if (checkpoint.previous_checkpoint_root !== previousRoot) checkpointErrors.push(`${path.basename(absolute)}: previous checkpoint root mismatch`);
  if (checkpoint.checkpoint_root !== L.hashValue(material)) checkpointErrors.push(`${path.basename(absolute)}: checkpoint root mismatch`);
  if (checkpoint.event_file_hash_basis !== 'SHA-256 of UTF-8 event JSON with CRLF normalized to LF.') {
    checkpointErrors.push(`${path.basename(absolute)}: event file hash basis is missing or changed`);
  }
  const sealedRecords = [];
  for (const [relative, digest] of Object.entries(checkpoint.event_files || {})) {
    const target = path.join(L.repoRoot, relative);
    if (!fs.existsSync(target) || L.sha256CanonicalTextBytes(fs.readFileSync(target)) !== digest) {
      checkpointErrors.push(`${path.basename(absolute)}: sealed event changed or missing: ${relative}`);
    } else {
      sealedRecords.push({ absolute: target, relative, event: L.loadJson(target) });
    }
  }
  if (checkpoint.event_count !== sealedRecords.length) checkpointErrors.push(`${path.basename(absolute)}: event_count differs from sealed event inventory`);
  if (sealedRecords.length && checkpoint.projection_root !== L.projectionRoot(L.replay(sealedRecords))) checkpointErrors.push(`${path.basename(absolute)}: historical projection root mismatch`);
  const sealedVerdict = L.verifyLedger(sealedRecords);
  const sealedStreams = {};
  for (const [stream, entries] of sealedVerdict.streams) {
    const head = entries[entries.length - 1].event;
    sealedStreams[stream] = { sequence: head.sequence, event_id: head.event_id, event_hash: head.event_hash };
  }
  if (!sealedVerdict.ok || L.canonicalize(checkpoint.streams) !== L.canonicalize(sealedStreams)) {
    checkpointErrors.push(`${path.basename(absolute)}: declared stream heads differ from sealed event prefix`);
  }
  const policyRef = checkpoint.capability_policy_ref || '';
  const policy = path.join(L.repoRoot, policyRef);
  if (!/^governance\/ledger\/policy\/capabilities\.v\d+\.json$/.test(policyRef) || !fs.existsSync(policy) || checkpoint.capability_policy_sha256 !== L.sha256CanonicalTextBytes(fs.readFileSync(policy))) {
    checkpointErrors.push(`${path.basename(absolute)}: capability policy reference or digest mismatch`);
  }
  previousRoot = checkpoint.checkpoint_root;
}
if (!checkpoints.length) H.fail('checkpoint inventory', 'no checkpoint exists');
else if (checkpointErrors.length) H.fail('sealed checkpoints', checkpointErrors);
else H.pass(`${checkpoints.length} checkpoint(s) bind event bytes, policy, and projection root`);

process.exit(H.summarize('GOVERNANCE CHAIN'));
