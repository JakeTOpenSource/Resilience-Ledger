#!/usr/bin/env node
'use strict';

const child = require('child_process');
const path = require('path');

const scripts = [
  'append-only-history.js',
  'verify-schema-contract.js',
  'verify-chain.js',
  'replay.js',
  'privacy-boundary.js',
  'verify-six-signal-surface.js',
  'verify-authority.js',
  'authority-falsification.js',
  'falsification.js',
  'verify-replayers.js'
];
let failed = false;
for (const script of scripts) {
  const args = [path.join(__dirname, script)];
  if (script === 'replay.js') args.push('--verify');
  const result = child.spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
