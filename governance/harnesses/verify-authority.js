#!/usr/bin/env node
'use strict';

const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

const policy = L.loadJson(require('path').join(L.ledgerRoot, 'policy', 'capabilities.v1.json'));
const errors = [];
const rank = { C0: 0, C1: 1, C2: 2, C3: 3 };

for (const { relative, event } of L.loadEvents()) {
  const role = policy.roles[event.actor.role];
  if (!role) { errors.push(`${relative}: unknown actor role ${event.actor.role}`); continue; }
  if (rank[event.consequence_class] > rank[role.max_consequence_class]) errors.push(`${relative}: role exceeds ${role.max_consequence_class}`);
  if (!role.event_types.includes('*') && !role.event_types.includes(event.event_type)) errors.push(`${relative}: role cannot emit ${event.event_type}`);
  if (!role.effect_kinds.includes(event.effect.kind)) errors.push(`${relative}: role cannot record effect ${event.effect.kind}`);
  if (rank[event.consequence_class] >= rank.C2 && !event.authority_ref) errors.push(`${relative}: C2/C3 event lacks authority_ref`);
  if (event.actor.role.startsWith('agent_') && event.status_axes.acceptance === 'ACCEPT') errors.push(`${relative}: agent adapter silently accepts state`);
}

if (errors.length) H.fail('event capability matrix', errors);
else H.pass('event roles, consequence ceilings, effects, and authority references hold');
process.exit(H.summarize('AUTHORITY'));
