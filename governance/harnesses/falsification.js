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

process.exit(H.summarize('LEDGER FALSIFICATION'));
