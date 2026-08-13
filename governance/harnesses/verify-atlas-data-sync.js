#!/usr/bin/env node
'use strict';

/*
 * Read-only public-data drift detector. It is deliberately narrower than a
 * generator: it inventories the declared candidate source and selected
 * projections, then compares them to a recorded baseline. It authorizes no
 * source, review label, state transition, or publication.
 */

const fs = require('fs');
const path = require('path');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

const CONTRACT_PATH = path.join(L.repoRoot, 'governance', 'contracts', 'atlas-data-sync.contract.v1.json');
const REQUIRED_PROJECTION_KEYS = ['expected', 'id', 'kind', 'path'];

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(L.repoRoot, relative), 'utf8'));
}

function canonicalTextHash(text) {
  return L.sha256CanonicalTextBytes(Buffer.from(text, 'utf8'));
}

function jsonHash(value) {
  return L.hashValue(value);
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function parseInlineJson(text, marker, relative) {
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) throw new Error(`${relative}: marker ${JSON.stringify(marker)} is missing`);
  const start = markerIndex + marker.length;
  if (text[start] !== '{') throw new Error(`${relative}: marker must be followed immediately by a JSON object`);
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index++) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth++;
    else if (char === '}') {
      depth--;
      if (depth === 0) {
        if (text[index + 1] !== ';') throw new Error(`${relative}: inline JSON object must end with a semicolon`);
        return JSON.parse(text.slice(start, index + 1));
      }
      if (depth < 0) break;
    }
  }
  throw new Error(`${relative}: inline JSON object is unterminated`);
}

function readProjection(spec) {
  const absolute = path.join(L.repoRoot, spec.path);
  const text = fs.readFileSync(absolute, 'utf8');
  if (spec.kind === 'TEXT_DOCUMENT') return { text, data: null };
  if (spec.kind === 'JSON_DOCUMENT') return { text, data: JSON.parse(text) };
  if (spec.kind === 'INLINE_CONST_DATA') return { text, data: parseInlineJson(text, spec.marker, spec.path) };
  throw new Error(`${spec.id}: unsupported projection kind ${spec.kind}`);
}

function stringArray(value, label) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) throw new Error(`${label} must be an array of strings`);
  return value;
}

function statusCounts(terms) {
  const counts = {};
  for (const term of terms) {
    const status = typeof term.status === 'string' ? term.status : '__MISSING__';
    counts[status] = (counts[status] || 0) + 1;
  }
  return Object.fromEntries(Object.keys(counts).sort(compareText).map((key) => [key, counts[key]]));
}

function termIndex(terms, label) {
  const map = new Map();
  for (const term of terms) {
    requireObject(term, `${label} term`);
    if (typeof term.id !== 'string' || !term.id) throw new Error(`${label}: every term must have a nonempty string id`);
    if (map.has(term.id)) throw new Error(`${label}: duplicate term id ${term.id}`);
    map.set(term.id, term);
  }
  return map;
}

function termSummary(terms, label) {
  const index = termIndex(terms, label);
  const ids = [...index.keys()];
  return {
    count: terms.length,
    ordered_ids_sha256: jsonHash(ids),
    status_counts: statusCounts(terms)
  };
}

function valueArray(data, key, label) {
  if (key === null) return null;
  if (!Array.isArray(data[key])) throw new Error(`${label}: expected array property ${key}`);
  return data[key];
}

function compareTerms(candidateTerms, projectionTerms, candidateLabel, projectionLabel) {
  const candidate = termIndex(candidateTerms, candidateLabel);
  const projection = termIndex(projectionTerms, projectionLabel);
  const candidateIdsMissingFromProjection = [...candidate.keys()].filter((id) => !projection.has(id)).sort(compareText);
  const projectionIdsMissingFromCandidate = [...projection.keys()].filter((id) => !candidate.has(id)).sort(compareText);
  const sharedIds = [...candidate.keys()].filter((id) => projection.has(id)).sort(compareText);
  const differentTermIds = sharedIds.filter((id) => L.canonicalize(candidate.get(id)) !== L.canonicalize(projection.get(id)));
  const statusMismatchIds = sharedIds.filter((id) => candidate.get(id).status !== projection.get(id).status);
  return {
    shared_term_count: sharedIds.length,
    identical_term_record_count: sharedIds.length - differentTermIds.length,
    different_term_record_count: differentTermIds.length,
    candidate_ids_missing_from_projection_count: candidateIdsMissingFromProjection.length,
    candidate_ids_missing_from_projection_sha256: jsonHash(candidateIdsMissingFromProjection),
    projection_ids_missing_from_candidate_count: projectionIdsMissingFromCandidate.length,
    projection_ids_missing_from_candidate_sha256: jsonHash(projectionIdsMissingFromCandidate),
    common_status_mismatch_count: statusMismatchIds.length,
    common_status_mismatch_ids_sha256: jsonHash(statusMismatchIds)
  };
}

function inventoryJsonData(data, spec, candidateTerms) {
  requireObject(data, `${spec.id} data`);
  const terms = valueArray(data, spec.term_key, spec.id);
  const sources = valueArray(data, spec.source_key, spec.id);
  const relations = valueArray(data, spec.relation_key, spec.id);
  const out = {
    canonical_json_sha256: jsonHash(data),
    terms: termSummary(terms, spec.id),
    sources_count: sources === null ? null : sources.length,
    relations_count: relations === null ? null : relations.length,
    comparison_to_candidate_source: compareTerms(candidateTerms, terms, 'candidate source', spec.id)
  };
  return out;
}

function inventoryText(text) {
  return {
    canonical_text_sha256: canonicalTextHash(text),
    byte_length: Buffer.byteLength(text, 'utf8')
  };
}

function inventoryContract(contract) {
  requireObject(contract, 'contract');
  if (contract.schema_version !== '1.0.0') throw new Error('contract schema_version must be 1.0.0');
  if (contract.decision !== 'DEFER') throw new Error('contract must remain DEFER while semantic acceptance is unresolved');
  if (!Array.isArray(contract.projections) || contract.projections.length !== 6) throw new Error('contract must enumerate exactly six public projections');
  const source = readJson(contract.candidate_source.path);
  requireObject(source, 'candidate source');
  const candidateTerms = valueArray(source, 'terms', 'candidate source');
  const candidateSources = valueArray(source, 'sources', 'candidate source');
  const candidateRelations = valueArray(source, 'relations', 'candidate source');
  const result = {
    candidate_source: {
      canonical_json_sha256: jsonHash(source),
      canonical_text_sha256: canonicalTextHash(fs.readFileSync(path.join(L.repoRoot, contract.candidate_source.path), 'utf8')),
      terms: termSummary(candidateTerms, 'candidate source'),
      sources_count: candidateSources.length,
      relations_count: candidateRelations.length
    },
    projections: {}
  };
  const seenIds = new Set();
  for (const spec of contract.projections) {
    requireObject(spec, 'projection specification');
    const keys = Object.keys(spec).sort(compareText);
    if (!REQUIRED_PROJECTION_KEYS.every((key) => keys.includes(key))) throw new Error('projection specification is missing a required key');
    if (typeof spec.id !== 'string' || !spec.id || seenIds.has(spec.id)) throw new Error(`projection id must be unique and nonempty: ${spec.id}`);
    seenIds.add(spec.id);
    const loaded = readProjection(spec);
    result.projections[spec.id] = spec.kind === 'TEXT_DOCUMENT'
      ? inventoryText(loaded.text)
      : inventoryJsonData(loaded.data, spec, candidateTerms);
  }
  return result;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function diff(expected, actual, trail = '$', errors = []) {
  if (typeof expected !== typeof actual || expected === null || actual === null) {
    if (expected !== actual) errors.push(`${trail}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    return errors;
  }
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || expected.length !== actual.length) {
      errors.push(`${trail}: array length differs`);
      return errors;
    }
    expected.forEach((item, index) => diff(item, actual[index], `${trail}[${index}]`, errors));
    return errors;
  }
  if (expected && typeof expected === 'object') {
    const expectedKeys = Object.keys(expected).sort(compareText);
    const actualKeys = Object.keys(actual || {}).sort(compareText);
    if (JSON.stringify(expectedKeys) !== JSON.stringify(actualKeys)) {
      errors.push(`${trail}: object keys differ`);
      return errors;
    }
    expectedKeys.forEach((key) => diff(expected[key], actual[key], `${trail}.${key}`, errors));
    return errors;
  }
  if (expected !== actual) errors.push(`${trail}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  return errors;
}

function validateExpected(contract, inventory) {
  const errors = [];
  if (!contract.candidate_source.expected || Object.keys(contract.candidate_source.expected).length === 0) {
    errors.push('candidate source baseline is not recorded');
  } else {
    diff(contract.candidate_source.expected, inventory.candidate_source, '$.candidate_source', errors);
  }
  for (const spec of contract.projections) {
    if (!spec.expected || Object.keys(spec.expected).length === 0) errors.push(`${spec.id}: baseline is not recorded`);
    else diff(spec.expected, inventory.projections[spec.id], `$.projections.${spec.id}`, errors);
  }
  return errors;
}

function mustReject(label, contract, inventory) {
  const failures = validateExpected(contract, inventory);
  if (failures.length === 0) throw new Error(`${label} mutation was accepted`);
}

function runCanaries() {
  const contract = readJson(path.relative(L.repoRoot, CONTRACT_PATH));
  const inventory = inventoryContract(contract);
  const source = readJson(contract.candidate_source.path);
  const duplicateCandidate = deepClone(source);
  duplicateCandidate.terms.push(deepClone(duplicateCandidate.terms[0]));
  let duplicateRejected = false;
  try { inventoryJsonData(duplicateCandidate, { id: 'duplicate-candidate', term_key: 'terms', source_key: 'sources', relation_key: 'relations' }, duplicateCandidate.terms); }
  catch (error) { duplicateRejected = /duplicate term id/.test(error.message); }
  if (!duplicateRejected) throw new Error('duplicate candidate id mutation was not rejected');

  const mutatedSource = deepClone(source);
  mutatedSource.terms[0].function_statement += ' [synthetic mutation]';
  const mutatedSourceInventory = deepClone(inventory);
  mutatedSourceInventory.candidate_source = {
    canonical_json_sha256: jsonHash(mutatedSource),
    canonical_text_sha256: inventory.candidate_source.canonical_text_sha256,
    terms: termSummary(mutatedSource.terms, 'mutated candidate source'),
    sources_count: mutatedSource.sources.length,
    relations_count: mutatedSource.relations.length
  };
  mustReject('candidate source record', contract, mutatedSourceInventory);

  const projectionSpec = contract.projections[0];
  const mutatedProjection = deepClone(readProjection(projectionSpec).data);
  mutatedProjection.terms[0].function_statement += ' [synthetic mutation]';
  const mutatedProjectionInventory = deepClone(inventory);
  mutatedProjectionInventory.projections[projectionSpec.id] = inventoryJsonData(
    mutatedProjection,
    projectionSpec,
    source.terms
  );
  mustReject('projection record', contract, mutatedProjectionInventory);
  return 3;
}

function main() {
  const contract = readJson(path.relative(L.repoRoot, CONTRACT_PATH));
  const inventory = inventoryContract(contract);
  if (process.argv.includes('--inventory')) {
    process.stdout.write(JSON.stringify(inventory, null, 2) + '\n');
    return 0;
  }
  const errors = validateExpected(contract, inventory);
  let canaryCount = 0;
  try { canaryCount = runCanaries(); }
  catch (error) { errors.push(error.message); }
  if (errors.length) H.fail('Atlas candidate-source and projection baseline', errors);
  else H.pass('one declared candidate source and six public projections match their explicit, non-accepting baseline');
  if (canaryCount) H.pass(`${canaryCount} in-memory data-contract mutations are rejected`);
  process.exit(H.summarize('ATLAS DATA SYNC'));
}

main();
