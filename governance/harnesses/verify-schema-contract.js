#!/usr/bin/env node
'use strict';

const path = require('path');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

const errors = [];
const schemas = {
  '1.0.0': L.loadJson(path.join(L.ledgerRoot, 'schemas', 'event.v1.schema.json')),
  '2.0.0': L.loadJson(path.join(L.ledgerRoot, 'schemas', 'event.v2.schema.json'))
};

for (const [version, schema] of Object.entries(schemas)) {
  if (!schema.properties || !schema.properties.schema_version || schema.properties.schema_version.const !== version) {
    errors.push(`event schema ${version}: schema_version const mismatch`);
    continue;
  }
  const schemaAxes = schema.properties.status_axes && schema.properties.status_axes.properties;
  const runtimeAxes = L.AXES_BY_SCHEMA[version];
  if (!schemaAxes || !runtimeAxes || Object.keys(schemaAxes).sort().join(',') !== Object.keys(runtimeAxes).sort().join(',')) {
    errors.push(`event schema ${version}: axis names differ from runtime validator`);
    continue;
  }
  for (const [axis, allowed] of Object.entries(runtimeAxes)) {
    if (L.canonicalize(schemaAxes[axis].enum) !== L.canonicalize(allowed)) {
      errors.push(`event schema ${version}: ${axis} enum differs from runtime validator`);
    }
  }
}

const v2 = schemas['2.0.0'];
if (v2.properties.status_vocabulary.const !== L.VOCABULARY_BY_SCHEMA['2.0.0']) {
  errors.push('event schema 2.0.0: status vocabulary differs from runtime validator');
}
if (v2.properties.capability_policy_ref.const !== L.POLICY_BY_SCHEMA['2.0.0']) {
  errors.push('event schema 2.0.0: capability policy differs from runtime validator');
}

for (const { relative, event } of L.loadEvents()) {
  for (const error of L.validateEvent(event)) errors.push(`${relative}: ${error}`);
}

if (errors.length) H.fail('schema/runtime contract', errors);
else H.pass('event schemas, runtime validators, vocabularies, and committed envelopes agree');
process.exit(H.summarize('SCHEMA CONTRACT'));
