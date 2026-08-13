#!/usr/bin/env node
'use strict';

/*
 * Deterministic, offline candidate-data materializer for Atlas consumers.
 *
 * This file deliberately has no write mode.  It produces in-memory data (or an
 * explicit stdout export) from a declared input and is not authority to replace
 * any page's embedded data.  In particular, matching an output digest says
 * nothing about a term's correctness, source validity, review status, or STP
 * accepted state.
 */

const fs = require('fs');
const path = require('path');
const L = require('../ledger/lib.js');

const SOURCE_PATH = path.join(L.repoRoot, 'terms.enriched.json');
const PROFILE_IDS = Object.freeze(['ask-ground-truth-v1', 'explore-v1', 'gap-check-v1']);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function requireString(value, label) {
  if (typeof value !== 'string' || !value) throw new Error(`${label} must be a nonempty string`);
}

function requireStringArray(value, label) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string' && item)) throw new Error(`${label} must be an array of nonempty strings`);
}

function validateCandidateSource(data) {
  requireObject(data, 'candidate source');
  if (!Array.isArray(data.terms) || !Array.isArray(data.sources) || !Array.isArray(data.relations)) {
    throw new Error('candidate source must contain terms, sources, and relations arrays');
  }
  const ids = new Set();
  for (const term of data.terms) {
    requireObject(term, 'candidate term');
    requireString(term.id, 'candidate term id');
    if (ids.has(term.id)) throw new Error(`candidate source contains duplicate term id ${term.id}`);
    ids.add(term.id);
    requireString(term.function_statement, `${term.id}.function_statement`);
    requireObject(term.names, `${term.id}.names`);
    requireStringArray(term.names.plain, `${term.id}.names.plain`);
    requireString(term.cluster, `${term.id}.cluster`);
    requireString(term.purpose, `${term.id}.purpose`);
    requireString(term.status, `${term.id}.status`);
    requireObject(term.attributes, `${term.id}.attributes`);
    requireString(term.attributes.accountability, `${term.id}.attributes.accountability`);
  }
  for (const relation of data.relations) {
    requireObject(relation, 'candidate relation');
    requireString(relation.source, 'candidate relation source');
    requireString(relation.target, 'candidate relation target');
    requireString(relation.type, 'candidate relation type');
    if (!ids.has(relation.source) || !ids.has(relation.target)) throw new Error('candidate relation refers to a missing term id');
  }
  return data;
}

function readCandidateSource() {
  return validateCandidateSource(JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8')));
}

function aliasesFromPlainNames(term) {
  // This is a display projection only: it preserves the input's plain names,
  // normalizes casing for the Gap Check matcher, removes duplicate strings, and
  // orders them bytewise. It does not create synonyms from model inference.
  const names = term.names.plain.length ? term.names.plain : [displayName(term)];
  return [...new Set(names.map((name) => name.toLocaleLowerCase('en-US')))].sort(compareText);
}

function displayName(term) {
  if (term.names.plain.length) return term.names.plain[0];
  if (Array.isArray(term.names.technical) && term.names.technical[0] && typeof term.names.technical[0].name === 'string' && term.names.technical[0].name) {
    return term.names.technical[0].name;
  }
  throw new Error(`${term.id}.names must contain a plain name or a technical name`);
}

function gapCheckTerm(term) {
  const out = {
    id: term.id,
    name: displayName(term),
    cluster: term.cluster,
    purpose: term.purpose,
    status: term.status,
    acct: term.attributes.accountability,
    def: term.function_statement,
    aliases: aliasesFromPlainNames(term)
  };
  if (Array.isArray(term.prov)) out.prov = clone(term.prov);
  return out;
}

function materialize(profileId, candidate = readCandidateSource()) {
  validateCandidateSource(candidate);
  if (!PROFILE_IDS.includes(profileId)) throw new Error(`unknown profile ${profileId}`);
  if (profileId === 'ask-ground-truth-v1') {
    return { terms: clone(candidate.terms), relations: clone(candidate.relations), sources: clone(candidate.sources) };
  }
  if (profileId === 'explore-v1') {
    return { terms: clone(candidate.terms), relations: clone(candidate.relations) };
  }
  return {
    terms: candidate.terms.map(gapCheckTerm),
    rels: candidate.relations.map((relation) => [relation.source, relation.target, relation.type])
  };
}

function inventory(candidate = readCandidateSource()) {
  validateCandidateSource(candidate);
  const profiles = {};
  for (const profileId of PROFILE_IDS) {
    const output = materialize(profileId, candidate);
    const terms = output.terms;
    const relationCount = Array.isArray(output.relations) ? output.relations.length : output.rels.length;
    profiles[profileId] = {
      canonical_json_sha256: L.hashValue(output),
      terms_count: terms.length,
      ordered_ids_sha256: L.hashValue(terms.map((term) => term.id)),
      relation_count: relationCount
    };
  }
  return {
    source_canonical_json_sha256: L.hashValue(candidate),
    source_terms_count: candidate.terms.length,
    profiles
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--inventory') {
    process.stdout.write(JSON.stringify(inventory(), null, 2) + '\n');
    return;
  }
  if (args.length === 2 && args[0] === '--emit' && PROFILE_IDS.includes(args[1])) {
    process.stdout.write(JSON.stringify(materialize(args[1]), null, 2) + '\n');
    return;
  }
  process.stderr.write('Usage: node governance/harnesses/materialize-atlas-candidate.js --inventory | --emit <profile>\n');
  process.exitCode = 2;
}

if (require.main === module) main();

module.exports = { PROFILE_IDS, aliasesFromPlainNames, displayName, gapCheckTerm, inventory, materialize, readCandidateSource, validateCandidateSource };
