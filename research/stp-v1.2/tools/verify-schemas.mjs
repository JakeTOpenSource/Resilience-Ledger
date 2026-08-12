import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

function json(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function fail(message, errors = []) {
  const details = errors.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ");
  throw new Error(details ? `${message}: ${details}` : message);
}

const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: true });
addFormats(ajv);
const byVersion = new Map();
for (const name of readdirSync("schemas").filter((item) => item.endsWith(".schema.json")).sort()) {
  const schema = json(join("schemas", name));
  ajv.addSchema(schema);
  const version = schema.properties?.schema_version?.const;
  if (version) {
    if (byVersion.has(version)) fail(`duplicate schema_version ${version}`);
    byVersion.set(version, schema.$id);
  }
}

function validateVersioned(value, label) {
  const id = byVersion.get(value.schema_version);
  if (!id) fail(`${label}: unknown schema_version ${value.schema_version}`);
  const validate = ajv.getSchema(id);
  if (!validate(value)) fail(`${label}: schema rejection`, validate.errors ?? []);
}

const concurrency = json("fixtures/concurrency/conformance-cases.json");
validateVersioned(concurrency, "concurrency fixture");

const instrumented = json("fixtures/instrumented-transition/conformance-cases.json");
validateVersioned(instrumented, "instrumented-transition fixture");
for (const profile of instrumented.instrument_profiles) {
  validateVersioned(profile, `instrument profile ${profile.instrument_id}`);
}
for (const item of instrumented.instrument_cases) {
  for (const event of item.events) validateVersioned(event, `instrument event ${event.event_id}`);
}

const invalidConcurrency = structuredClone(concurrency);
delete invalidConcurrency.effect_cases[0].events[0].previous_sequence;
const validateConcurrency = ajv.getSchema(byVersion.get(concurrency.schema_version));
if (validateConcurrency(invalidConcurrency)) fail("schema mutation accepted a missing effect predecessor");

const invalidNull = structuredClone(instrumented);
delete invalidNull.instrument_cases[0].events[4].observation.value;
const validateInstrumented = ajv.getSchema(byVersion.get(instrumented.schema_version));
if (validateInstrumented(invalidNull)) fail("schema mutation accepted a domain null without a present value");

const invalidAbsent = structuredClone(instrumented);
invalidAbsent.instrument_cases[1].events[4].observation.value = null;
if (validateInstrumented(invalidAbsent)) fail("schema mutation accepted an absent measurement with a value");

process.stdout.write("public packet schemas and 3 rejection mutations: PASS\n");
