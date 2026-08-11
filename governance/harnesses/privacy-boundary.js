#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

const roots = [
  path.join(L.ledgerRoot, 'events'),
  path.join(L.ledgerRoot, 'checkpoints'),
  path.join(L.repoRoot, 'governance')
];
const files = [...new Set(roots.flatMap((root) => L.jsonFiles(root)))];
const errors = [];
const forbiddenKeys = new Set([
  'account_id', 'api_key', 'authorization_header', 'credential', 'local_path', 'password',
  'private_hash', 'private_path', 'raw_private_hash', 'secret', 'token'
]);
const forbiddenText = [
  [/(?:^|[^A-Za-z])[A-Za-z]:[\\/]/, 'absolute Windows path'],
  [/file:\/\//i, 'file URI'],
  [/(?:^|[\\/])AppData(?:[\\/]|$)/i, 'AppData path'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key material'],
  [/gh[pousr]_[A-Za-z0-9_]{20,}/, 'GitHub token-like value'],
  [/sk-[A-Za-z0-9_-]{20,}/, 'secret-key-like value']
];

function scan(node, relative, trail = '$') {
  if (typeof node === 'string') {
    for (const [pattern, label] of forbiddenText) if (pattern.test(node)) errors.push(`${relative} ${trail}: ${label}`);
    return;
  }
  if (Array.isArray(node)) return node.forEach((child, index) => scan(child, relative, `${trail}[${index}]`));
  if (!node || typeof node !== 'object') return;
  for (const [key, child] of Object.entries(node)) {
    if (forbiddenKeys.has(key.toLowerCase())) errors.push(`${relative} ${trail}.${key}: forbidden public key`);
    scan(child, relative, `${trail}.${key}`);
  }
}

for (const absolute of files) {
  const relative = path.relative(L.repoRoot, absolute).split(path.sep).join('/');
  let value;
  try { value = JSON.parse(fs.readFileSync(absolute, 'utf8')); }
  catch (error) { errors.push(`${relative}: ${error.message}`); continue; }
  scan(value, relative);
  if (relative.includes('/ledger/events/') && value.classification !== 'PUBLIC') errors.push(`${relative}: a non-public event cannot enter this public ledger`);
  for (const ref of value.evidence_refs || []) if (ref.classification !== 'PUBLIC') errors.push(`${relative}: public event references non-public evidence directly`);
}

const canaries = [
  { value: { local_path: 'redacted' }, expected: 'forbidden public key' },
  { value: { note: 'C:\\Users\\Example\\private.txt' }, expected: 'absolute Windows path' },
  { value: { token: 'redacted' }, expected: 'forbidden public key' }
];
for (const [index, canary] of canaries.entries()) {
  const before = errors.length;
  scan(canary.value, `canary-${index}`);
  if (errors.length === before) errors.push(`canary-${index}: scanner failed to detect ${canary.expected}`);
  else errors.splice(before);
}

if (errors.length) H.fail('public ledger privacy boundary', errors);
else H.pass(`${files.length} public governance JSON records contain no denied path, key, or secret pattern`);
H.pass(`${canaries.length} synthetic leak canaries are detected`);
process.exit(H.summarize('PRIVACY BOUNDARY'));
