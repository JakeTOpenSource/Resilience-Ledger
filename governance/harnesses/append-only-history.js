#!/usr/bin/env node
'use strict';

const child = require('child_process');
const fs = require('fs');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

function git(args) {
  const result = child.spawnSync('git', args, { cwd: L.repoRoot, encoding: 'utf8' });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'git failed').trim());
  return result.stdout.trim();
}

function tryGit(args) {
  try { return git(args); }
  catch (_) { return null; }
}

function githubEvent() {
  if (!process.env.GITHUB_EVENT_PATH) return {};
  try { return JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')); }
  catch (_) { return {}; }
}

function resolveBase() {
  if (process.env.GOVERNANCE_BASE_REF) return git(['rev-parse', '--verify', process.env.GOVERNANCE_BASE_REF]);

  const event = githubEvent();

  // Pull-request checkouts normally expose origin/<base>. GitHub's synthetic
  // merge commit keeps the exact base as its first parent when they do not.
  if (process.env.GITHUB_BASE_REF) {
    const remote = `origin/${process.env.GITHUB_BASE_REF}`;
    const remoteBase = tryGit(['merge-base', 'HEAD', remote]);
    if (remoteBase) return remoteBase;
    const payloadBase = event.pull_request && event.pull_request.base && event.pull_request.base.sha;
    const verifiedPayloadBase = payloadBase && tryGit(['rev-parse', '--verify', payloadBase]);
    if (verifiedPayloadBase) return verifiedPayloadBase;
    return git(['rev-parse', '--verify', 'HEAD^1']);
  }

  const defaultBranch = event.repository && event.repository.default_branch;
  const pushedBranch = event.ref && event.ref.replace(/^refs\/heads\//, '');
  const before = event.before;

  // A default-branch push must compare with the state accepted immediately
  // before the push. Feature pushes compare with the accepted default branch,
  // allowing corrections within a not-yet-accepted proposal.
  if (defaultBranch && pushedBranch === defaultBranch && before && !/^0+$/.test(before)) {
    const beforeBase = tryGit(['rev-parse', '--verify', before]);
    if (beforeBase) return beforeBase;
  }
  if (defaultBranch) {
    const remoteDefault = `origin/${defaultBranch}`;
    const defaultBase = tryGit(['merge-base', 'HEAD', remoteDefault]);
    if (defaultBase) return defaultBase;
  }

  // Local feature work follows the remote's declared default branch. This is
  // also the safe fallback for CI environments with no usable event payload.
  const currentBranch = tryGit(['branch', '--show-current']);
  const remoteHead = tryGit(['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
  if (remoteHead) {
    const remoteBranch = remoteHead.replace(/^origin\//, '');
    if (currentBranch !== remoteBranch) {
      const localBase = tryGit(['merge-base', 'HEAD', remoteHead]);
      if (localBase) return localBase;
    }
  }

  for (const candidate of ['origin/main', 'origin/master']) {
    const candidateBase = tryGit(['merge-base', 'HEAD', candidate]);
    if (candidateBase) return candidateBase;
  }

  // A local default-branch working tree has no prior event payload. Comparing
  // with HEAD still catches edits before commit; CI enforces committed pushes.
  return tryGit(['rev-parse', '--verify', 'HEAD']) || git(['rev-parse', '--verify', 'HEAD^']);
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
