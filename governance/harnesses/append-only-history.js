#!/usr/bin/env node
'use strict';

const child = require('child_process');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

function git(args) {
  const result = child.spawnSync('git', args, { cwd: L.repoRoot, encoding: 'utf8' });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'git failed').trim());
  return result.stdout.trim();
}

function resolveBase() {
  if (process.env.GOVERNANCE_BASE_REF) return git(['rev-parse', '--verify', process.env.GOVERNANCE_BASE_REF]);
  if (process.env.GITHUB_BASE_REF) {
    const remote = `origin/${process.env.GITHUB_BASE_REF}`;
    return git(['merge-base', 'HEAD', remote]);
  }
  try { return git(['rev-parse', '--verify', 'HEAD^']); }
  catch (_) { return git(['rev-parse', '--verify', 'HEAD']); }
}

let base;
let lines = [];
const errors = [];
try {
  base = resolveBase();
  const output = git(['diff', '--name-status', '--find-renames', base, '--',
    'governance/ledger/events', 'governance/ledger/checkpoints',
    'governance/ledger/policy', 'governance/ledger/schemas']);
  lines = output ? output.split(/\r?\n/) : [];
} catch (error) {
  errors.push(`cannot resolve Git comparison base: ${error.message}`);
}

for (const line of lines) {
  const status = line.split(/\s+/)[0];
  if (status !== 'A') errors.push(`sealed history change ${line}`);
}

if (errors.length) H.fail('accepted event/checkpoint files are add-only', errors);
else H.pass(`Git history comparison permits additions only${base ? ` (base ${base.slice(0, 12)})` : ''}`);
H.pass('ceiling declared: Git branch protection and an external witness are required to resist history replacement');
process.exit(H.summarize('APPEND-ONLY HISTORY'));
