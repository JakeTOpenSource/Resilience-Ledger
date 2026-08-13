#!/usr/bin/env node
'use strict';

/* Verifies the pure candidate-data materializer; it has no consumer write path. */

const fs = require('fs');
const path = require('path');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');
const M = require('./materialize-atlas-candidate.js');

const CONTRACT = path.join(L.repoRoot, 'governance', 'contracts', 'atlas-data-materialization.contract.v1.json');

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function failIf(condition, message, errors) { if (condition) errors.push(message); }

function main() {
  const errors = [];
  const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'));
  const candidate = M.readCandidateSource();
  const first = M.inventory(candidate);
  const second = M.inventory(clone(candidate));
  failIf(contract.schema_version !== '1.0.0', 'contract schema_version must be 1.0.0', errors);
  failIf(contract.decision !== 'DEFER', 'materialization contract must remain DEFER', errors);
  failIf(contract.input.expected_canonical_json_sha256 !== first.source_canonical_json_sha256, 'candidate source digest differs from declared input', errors);
  failIf(JSON.stringify(first) !== JSON.stringify(second), 'same candidate input did not produce the same materialization inventory', errors);
  failIf(JSON.stringify(M.PROFILE_IDS) !== JSON.stringify(contract.profiles.map((profile) => profile.id)), 'contract profile ids differ from materializer profile ids', errors);
  for (const profile of contract.profiles) {
    failIf(JSON.stringify(first.profiles[profile.id]) !== JSON.stringify(profile.expected_output), `${profile.id} output differs from its declared receipt`, errors);
  }

  const gap = M.materialize('gap-check-v1', candidate);
  failIf(gap.terms.length !== candidate.terms.length, 'gap-check materialization dropped a candidate term', errors);
  failIf(gap.rels.length !== candidate.relations.length, 'gap-check materialization dropped a candidate relation', errors);
  failIf(gap.terms.some((term) => !Array.isArray(term.aliases) || !term.aliases.length), 'gap-check materialization emitted a term without aliases', errors);

  const duplicate = clone(candidate);
  duplicate.terms.push(clone(duplicate.terms[0]));
  try { M.materialize('explore-v1', duplicate); errors.push('duplicate-id candidate was accepted'); } catch (error) { /* expected */ }
  const malformed = clone(candidate);
  delete malformed.terms[0].attributes.accountability;
  try { M.materialize('gap-check-v1', malformed); errors.push('missing accountability was accepted'); } catch (error) { /* expected */ }
  const dangling = clone(candidate);
  dangling.relations[0].source = 'missing-id';
  try { M.materialize('ask-ground-truth-v1', dangling); errors.push('dangling relation was accepted'); } catch (error) { /* expected */ }

  if (errors.length) H.fail('candidate materialization contract', errors);
  else H.pass('three explicit candidate-only profiles replay deterministically and reject three malformed inputs');
  process.exit(H.summarize('ATLAS DATA MATERIALIZATION'));
}

main();
