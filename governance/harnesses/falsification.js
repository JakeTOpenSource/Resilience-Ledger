#!/usr/bin/env node
'use strict';

const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

const originals = L.loadEvents().map((row) => ({ relative: row.relative, absolute: row.absolute, event: JSON.parse(JSON.stringify(row.event)) }));

function mustFail(name, mutate, expectedFragment) {
  const rows = originals.map((row) => ({ ...row, event: JSON.parse(JSON.stringify(row.event)) }));
  mutate(rows);
  const errors = L.verifyLedger(rows).errors;
  if (errors.some((error) => error.includes(expectedFragment))) H.pass(name);
  else H.fail(name, `validator did not report ${expectedFragment}; got ${errors.join(' | ') || 'no error'}`);
}

mustFail('altered payload breaks sealed hashes', (rows) => { rows[0].event.payload.claim_ceiling = 'tampered'; }, 'payload_hash mismatch');
mustFail('broken previous hash is rejected', (rows) => {
  const copy = JSON.parse(JSON.stringify(rows[0].event));
  copy.event_id = 'evt_falsification_second_event';
  copy.sequence = 2;
  copy.idempotency_key = 'falsification:second';
  copy.prev_event_hash = '0'.repeat(64);
  copy.payload_hash = L.hashValue(copy.payload);
  copy.event_hash = L.eventHash(copy);
  rows.push({ relative: 'synthetic/second.json', absolute: '', event: copy });
}, 'prev_event_hash does not match');
mustFail('sequence gaps are rejected', (rows) => { rows[0].event.sequence = 3; }, 'expected sequence 1');
mustFail('duplicate event identity is rejected', (rows) => { rows[1].event.event_id = rows[0].event.event_id; }, 'duplicate event_id');
mustFail('duplicate idempotency key is rejected', (rows) => { rows[1].event.idempotency_key = rows[0].event.idempotency_key; }, 'duplicate idempotency_key');
mustFail('unknown parents are rejected', (rows) => { rows[0].event.parents = ['evt_missing_parent']; rows[0].event.event_hash = L.eventHash(rows[0].event); }, 'references unknown evt_missing_parent');
mustFail('collapsed status vocabulary is rejected', (rows) => { rows[0].event.status_axes.observation = 'PASS'; rows[0].event.event_hash = L.eventHash(rows[0].event); }, 'invalid status_axes.observation');
mustFail('non-portable numeric payloads are rejected', (rows) => {
  rows[0].event.payload.non_portable_number = 1.5;
  rows[0].event.payload_hash = L.hashValue(rows[0].event.payload);
  rows[0].event.event_hash = L.eventHash(rows[0].event);
}, 'canonical profile permits safe integers only');
mustFail('causal cycles are rejected', (rows) => {
  rows[0].event.parents = [rows[1].event.event_id];
  rows[1].event.parents = [rows[0].event.event_id];
  rows[0].event.event_hash = L.eventHash(rows[0].event);
  rows[1].event.event_hash = L.eventHash(rows[1].event);
}, 'causal cycle prevents deterministic replay');

{
  const rows = originals.map((row) => ({ ...row, event: JSON.parse(JSON.stringify(row.event)) }));
  const governance = rows.filter((row) => row.event.stream_id === 'governance').sort((a, b) => a.event.sequence - b.event.sequence);
  const head = governance[governance.length - 1];
  const second = { relative: 'synthetic/clock-inversion.json', absolute: '', event: JSON.parse(JSON.stringify(head.event)) };
  second.event.event_id = 'evt_governance_clock_inversion_probe';
  second.event.sequence = head.event.sequence + 1;
  second.event.prev_event_hash = head.event.event_hash;
  second.event.recorded_at = '2000-01-01T00:00:00Z';
  second.event.idempotency_key = 'falsification:clock-inversion';
  second.event.payload = { projection: { path: 'governance/authority-map.json', record: { probe: 'sequence-2' } } };
  second.event.payload_hash = L.hashValue(second.event.payload);
  second.event.event_hash = L.eventHash(second.event);
  rows.push(second);
  const projected = L.replay(rows)['governance/authority-map.json'];
  if (projected && projected.probe === 'sequence-2') H.pass('sequence and causal order defeat clock inversion');
  else H.fail('sequence and causal order defeat clock inversion', 'wall-clock metadata overrode sequence 2');
}

process.exit(H.summarize('LEDGER FALSIFICATION'));
