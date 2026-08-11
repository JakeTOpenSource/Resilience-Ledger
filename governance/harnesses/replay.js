#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('../ledger/lib.js');

function materialize() {
  const records = L.loadEvents();
  const projections = L.replay(records);
  return { records, projections, root: L.projectionRoot(projections) };
}

function verify(projections) {
  const errors = [];
  for (const [relative, expected] of Object.entries(projections)) {
    const absolute = path.join(L.repoRoot, relative);
    if (!fs.existsSync(absolute)) {
      errors.push(`${relative}: projection is missing`);
      continue;
    }
    let actual;
    try { actual = JSON.parse(fs.readFileSync(absolute, 'utf8')); }
    catch (error) { errors.push(`${relative}: ${error.message}`); continue; }
    if (L.canonicalize(actual) !== L.canonicalize(expected)) errors.push(`${relative}: projection diverges from ledger replay`);
  }
  return errors;
}

function write(projections) {
  for (const [relative, record] of Object.entries(projections)) {
    const absolute = path.join(L.repoRoot, relative);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, L.pretty(record), 'utf8');
    console.log(`wrote ${relative}`);
  }
}

function main() {
  const command = process.argv[2] || '--verify';
  let result;
  try { result = materialize(); }
  catch (error) { console.error(error.message); process.exit(1); }
  if (command === '--write') write(result.projections);
  else if (command === '--verify') {
    const errors = verify(result.projections);
    if (errors.length) {
      for (const error of errors) console.error(`FAIL  ${error}`);
      process.exit(1);
    }
    console.log(`PASS  ${Object.keys(result.projections).length} generated projections match ledger replay`);
  } else if (command !== '--root') {
    console.error('usage: node governance/harnesses/replay.js [--verify|--write|--root]');
    process.exit(2);
  }
  console.log(result.root);
}

if (require.main === module) main();
module.exports = { materialize, verify };
