#!/usr/bin/env node
'use strict';

const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');
const A = require('./verify-authority.js');

const originals = L.loadEvents().map((row) => ({ ...row, event: JSON.parse(JSON.stringify(row.event)) }));

function mustFail(name, mutate, expectedFragment) {
  const rows = originals.map((row) => ({ ...row, event: JSON.parse(JSON.stringify(row.event)) }));
  mutate(rows);
  const errors = A.validateAuthority(rows);
  if (errors.some((error) => error.includes(expectedFragment))) H.pass(name);
  else H.fail(name, `authority validator did not report ${expectedFragment}; got ${errors.join(' | ') || 'no error'}`);
}

mustFail('nonexistent authority references are rejected', (rows) => {
  const event = rows.find((row) => row.event.event_id === 'evt_governance_public_metadata_release_0002').event;
  event.authority_ref = 'governance/decision-log/does-not-exist.md';
  event.actor.auth_basis = event.authority_ref;
}, 'authority_ref does not resolve');

mustFail('undigested authority records are rejected', (rows) => {
  const event = rows.find((row) => row.event.event_id === 'evt_governance_public_metadata_release_0002').event;
  const evidence = event.evidence_refs.find((item) => item.source_locator === event.authority_ref);
  evidence.sha256 = '0'.repeat(64);
}, 'authority_ref is not an event or a digest-pinned decision record');

mustFail('effects without recovery contracts are rejected', (rows) => {
  const event = rows.find((row) => row.event.event_id === 'evt_governance_public_metadata_release_0002').event;
  event.effect = { kind: 'DELETION', target: 'governance/example.json', reversible: false, recovery_ref: null };
}, 'recovery_ref is not an event or a digest-pinned decision record');

mustFail('agent adapters cannot accept state', (rows) => {
  const event = rows.find((row) => row.event.event_id === 'evt_semantics_status_vocabulary_boundary_0001').event;
  event.actor.role = 'agent_observer';
  event.consequence_class = 'C1';
  event.authority_ref = null;
  event.status_axes.acceptance = 'ACCEPTED';
}, 'agent adapter silently accepts state');

process.exit(H.summarize('AUTHORITY FALSIFICATION'));
