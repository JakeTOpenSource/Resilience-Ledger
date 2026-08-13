#!/usr/bin/env node
'use strict';

const child = require('child_process');
const fs = require('fs');
const path = require('path');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

const manifestPath = 'governance/releases/atlas-foundational-repair.v1.json';
const eventPath = 'governance/ledger/events/governance/000007-atlas-foundational-repair-source-review.json';
const recordingCommit = '5242a1d3501b3f984ad5c98092b7488f3e606d58';
const manifestBytes = L.canonicalTextBytes(fs.readFileSync(path.join(L.repoRoot, manifestPath)));
const manifest = JSON.parse(manifestBytes.toString('utf8'));
const errors = [];
function hold(condition, message) { if (!condition) errors.push(message); }
function git(args, encoding = 'utf8') {
  try {
    return child.execFileSync('git', ['-c', `safe.directory=${L.repoRoot}`, ...args], {
      cwd: L.repoRoot, encoding, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (error) {
    throw new Error(`git ${args.join(' ')} failed: ${(error.stderr || error.message).toString().trim()}`);
  }
}
function sorted(entries) {
  return entries.map((entry) => ({ status: entry.status, path: entry.path }))
    .sort((a, b) => L.compareText(a.path, b.path) || L.compareText(a.status, b.status));
}

hold(manifest.schema_version === 'public-source-candidate.v1', 'manifest schema mismatch');
hold(manifest.classification === 'PUBLIC', 'manifest classification mismatch');
hold(new Set(manifest.exact_diff.map((entry) => entry.path)).size === manifest.exact_diff.length,
  'manifest paths are duplicated');
hold(manifest.claim_ceiling.includes('OWNER_MERGE_REQUIRED') &&
  manifest.claim_ceiling.includes('NOT_PRODUCTION_DEPLOYMENT') &&
  manifest.claim_ceiling.includes('NOT_SEMANTIC_TRUTH'), 'manifest claim ceiling is incomplete');

for (const ref of [manifest.base_commit, manifest.candidate_commit]) git(['cat-file', '-e', `${ref}^{commit}`]);
hold(git(['merge-base', '--is-ancestor', manifest.base_commit, manifest.candidate_commit]).length === 0,
  'candidate does not descend from the declared base');
hold(git(['rev-parse', `${manifest.candidate_commit}^{tree}`]).trim() === manifest.candidate_tree,
  'candidate tree mismatch');
const diff = git(['diff', '--name-status', '--no-renames', manifest.base_commit, manifest.candidate_commit, '--']).trim();
const actual = (diff ? diff.split(/\r?\n/) : []).map((line) => {
  const fields = line.split('\t');
  if (!/^[AMD]$/.test(fields[0]) || fields.length !== 2) throw new Error(`unsupported candidate diff row: ${line}`);
  return { status: fields[0], path: fields[1].replace(/\\/g, '/') };
});
hold(L.canonicalize(sorted(actual)) === L.canonicalize(sorted(manifest.exact_diff)), 'exact candidate diff mismatch');

const denied = [/[A-Za-z]:[\\/](?:Users|Documents|Downloads|AppData)[\\/]/, /gh[opsu]_[A-Za-z0-9]{20,}/,
  /chatgpt-conversation:\/\//, /\.codex[\\/]attachments/];
for (const entry of manifest.exact_diff.filter((item) => item.status !== 'D')) {
  const bytes = git(['show', `${manifest.candidate_commit}:${entry.path}`], null);
  const text = bytes.toString('utf8');
  for (const pattern of denied) hold(!pattern.test(text), `${entry.path}: denied public boundary pattern`);
}

const event = JSON.parse(fs.readFileSync(path.join(L.repoRoot, eventPath), 'utf8'));
git(['cat-file', '-e', `${recordingCommit}^{commit}`]);
hold(L.sha256CanonicalTextBytes(git(['show', `${recordingCommit}:${eventPath}`], null)) ===
  L.sha256CanonicalTextBytes(fs.readFileSync(path.join(L.repoRoot, eventPath))),
  'current source-review event differs from its recording commit');
for (const ref of event.evidence_refs) {
  hold(typeof ref.source_locator === 'string' && !path.isAbsolute(ref.source_locator) &&
    !ref.source_locator.split(/[\\/]/).includes('..'), `${ref.ref_id}: unsafe or missing evidence locator`);
  if (typeof ref.source_locator !== 'string' || path.isAbsolute(ref.source_locator) ||
      ref.source_locator.split(/[\\/]/).includes('..')) continue;
  let evidenceBytes = null;
  try { evidenceBytes = git(['show', `${recordingCommit}:${ref.source_locator}`], null); }
  catch (error) { hold(false, `${ref.ref_id}: evidence file is missing from the recording commit`); }
  if (!evidenceBytes) continue;
  hold(L.sha256CanonicalTextBytes(evidenceBytes) === ref.sha256,
    `${ref.ref_id}: historical evidence digest mismatch`);
}
const manifestEvidence = event.evidence_refs.find((ref) => ref.source_locator === manifestPath);
const recordedManifestBytes = L.canonicalTextBytes(git(['show', `${recordingCommit}:${manifestPath}`], null));
hold(manifestEvidence && manifestEvidence.sha256 === L.sha256Bytes(recordedManifestBytes) &&
  L.sha256Bytes(recordedManifestBytes) === L.sha256Bytes(manifestBytes),
  'governance event does not bind the candidate manifest');
hold(event.payload.candidate_commit === manifest.candidate_commit && event.payload.candidate_tree === manifest.candidate_tree,
  'governance event candidate identity mismatch');
hold(event.payload.production_deployment === 'NOT_ATTEMPTED' && event.payload.owner_merge_required === true,
  'governance event exceeds the source-review boundary');

if (errors.length) H.fail('Atlas foundational repair source candidate', errors);
else H.pass(`Atlas repair commit ${manifest.candidate_commit.slice(0, 12)}, tree ${manifest.candidate_tree.slice(0, 12)}, ${actual.length} exact paths, public boundary`);
process.exit(H.summarize('ATLAS FOUNDATIONAL REPAIR'));
