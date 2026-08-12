import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { canonical, evaluateFixture } from "./instrumented-transition.mjs";

function pythonCandidates() {
  return [process.env.DELTA_ATLAS_PYTHON, process.env.PYTHON, "python3", "python", "py"].filter(Boolean);
}

function runPython(path) {
  const errors = [];
  for (const candidate of pythonCandidates()) {
    const args = candidate === "py" ? ["-3", "tools/instrumented_transition.py", path] : ["tools/instrumented_transition.py", path];
    try {
      return execFileSync(candidate, args, { encoding: "utf8" }).trim();
    } catch (error) {
      if (error.code === "ENOENT") continue;
      errors.push(`${candidate}: ${error.message}`);
    }
  }
  throw new Error(`Python instrumented-transition reducer could not run.\n${errors.join("\n")}`);
}

const path = "fixtures/instrumented-transition/conformance-cases.json";
const fixture = JSON.parse(readFileSync(path, "utf8"));
const js = evaluateFixture(fixture);
const py = JSON.parse(runPython(path));
if (canonical(js) !== canonical(py)) throw new Error("instrumented-transition fixtures: JavaScript/Python disagreement");

for (const lane of ["instrument_cases", "survivability_cases", "economy_cases"]) {
  for (let index = 0; index < fixture[lane].length; index += 1) {
    const expected = fixture[lane][index].expected;
    const actual = js[lane][index].result;
    if (canonical(expected) !== canonical(actual)) {
      throw new Error(`${fixture[lane][index].case_id}: expected ${canonical(expected)} but received ${canonical(actual)}`);
    }
    process.stdout.write(`${fixture[lane][index].case_id}: ${actual.status} ${actual.reason_code}\n`);
  }
}
