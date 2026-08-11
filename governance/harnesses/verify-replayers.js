#!/usr/bin/env node
'use strict';

const child = require('child_process');
const path = require('path');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

function run(command, args) {
  return child.spawnSync(command, args, { cwd: L.repoRoot, encoding: 'utf8' });
}

function rootFrom(result) {
  if (result.status !== 0) return null;
  const lines = result.stdout.trim().split(/\r?\n/);
  return lines[lines.length - 1];
}

const nodeResult = run(process.execPath, ['governance/harnesses/replay.js', '--verify']);
const nodeRoot = rootFrom(nodeResult);
if (!nodeRoot) H.fail('Node replay', (nodeResult.stderr || nodeResult.stdout || 'failed').trim());
else H.pass(`Node replay root ${nodeRoot.slice(0, 12)}`);

const candidates = [];
if (process.env.PYTHON) candidates.push([process.env.PYTHON, []]);
candidates.push(['python', []], ['python3', []], ['py', ['-3']]);
let pythonResult = null;
let pythonCommand = null;
for (const [command, prefix] of candidates) {
  const candidate = run(command, [...prefix, 'governance/harnesses/replay.py', '--verify']);
  if (!candidate.error || candidate.error.code !== 'ENOENT') {
    pythonResult = candidate;
    pythonCommand = command;
    break;
  }
}
const pythonRoot = pythonResult && rootFrom(pythonResult);
if (!pythonRoot) H.fail('independent Python replay', pythonResult ? (pythonResult.stderr || pythonResult.stdout || 'failed').trim() : 'no Python runtime found; set PYTHON to an interpreter path');
else H.pass(`Python replay root ${pythonRoot.slice(0, 12)} via ${pythonCommand}`);

if (nodeRoot && pythonRoot && nodeRoot === pythonRoot) H.pass('independent implementations agree on the projection root');
else H.fail('cross-implementation agreement', `Node=${nodeRoot || 'FAIL'} Python=${pythonRoot || 'FAIL'}`);
process.exit(H.summarize('INDEPENDENT REPLAY'));
