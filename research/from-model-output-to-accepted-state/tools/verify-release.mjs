import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "release-manifest.json");
const textSuffixes = new Set([".cff", ".html", ".json", ".lean", ".md", ".mjs", ".ps1", ".py", ".svg", ".txt"]);
const privatePatterns = [
  ["absolute Windows user path", /[A-Za-z]:[\\/](?:Users|Documents|Downloads|AppData)[\\/]/i],
  ["absolute Unix user path", /\/(?:Users|home)\/[^/\s]+\//i],
  ["Codex private locator", /(?:\.codex[\\/]|codex-remote-attachments|codex-clipboard-)/i],
  ["workspace-only locator", /(?:work\/<wbr>|work\/(?:device-activation|transition-stable|probabilistic-audit|mathlib-zero-state))/i],
  ["local network locator", /(?:localhost|127\.0\.0\.1)/i],
  ["email address", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ["private key material", /-----BEGIN [A-Z ]*PRIVATE KEY-----/i],
];

function fail(message) {
  throw new Error(`VERIFY FAIL: ${message}`);
}

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function portable(path) {
  return path.split(sep).join("/");
}

function files(directory) {
  const output = [];
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    if (entry.name === ".tmp" || entry.name === "__pycache__") continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...files(absolute));
    else if (entry.isFile() && absolute !== manifestPath) output.push(portable(relative(root, absolute)));
  }
  return output.sort();
}

function rejectCompiledPythonCaches(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__pycache__") {
        for (const child of readdirSync(absolute)) found.push(portable(relative(root, join(absolute, child))));
      } else if (entry.name !== ".tmp") rejectCompiledPythonCaches(absolute);
    } else if (entry.isFile() && [".pyc", ".pyo"].includes(extname(entry.name).toLowerCase())) {
      found.push(portable(relative(root, absolute)));
    }
  }
  if (found.length) fail(`compiled Python cache present: ${JSON.stringify(found.sort())}`);
}

function verifyClaimRegister(manifest) {
  let register, author, reviewer;
  try {
    register = JSON.parse(readFileSync(join(root, "claims.json"), "utf8"));
    author = JSON.parse(readFileSync(join(root, "author-markers.json"), "utf8"));
    reviewer = JSON.parse(readFileSync(join(root, "reviewer-markers.template.json"), "utf8"));
  } catch (error) {
    fail(`claim register unreadable: ${error.message}`);
  }
  if (register.schema_version !== "fmota-claim-register.v1") fail("unknown claim-register schema");
  if (register.status !== "OWNER_REVIEW") fail("claim-register status mismatch");
  const expectedOutput = "paper/From-Model-Output-to-Accepted-State-Owner-Review-v4.pdf";
  if (register.paper_output_path !== expectedOutput) fail("claim-register paper output mismatch");
  if (!manifest.files?.[expectedOutput] || manifest.files[expectedOutput].role !== "paper-output") {
    fail("claim-register paper output is not manifest-bound");
  }
  for (const sourceName of ["content_a.py", "content_b.py", "content_c.py"]) {
    if (register.paper_source_sha256?.[sourceName] !== sha256(readFileSync(join(root, sourceName)))) {
      fail(`claim-register paper source mismatch: ${sourceName}`);
    }
  }
  const markerNames = ["OBSERVED", "OPEN", "PROPOSED", "TESTED"];
  const expectedPolicy = {
    TESTED: {
      meaning: "Exact behavior over a named finite corpus, reproducible by a stated command.",
      never_means: "That the behavior generalizes past that corpus.",
    },
    OBSERVED: {
      meaning: "A bounded inspection of a named surface at a recorded time.",
      never_means: "That the surface still looks that way, or that other surfaces match.",
    },
    PROPOSED: {
      meaning: "Specified or reasoned beyond the tested artifact boundary. It may have a partial fixture, but the marked claim itself is not established.",
      never_means: "Implemented behavior. Do not cite it as a result.",
    },
    OPEN: {
      meaning: "I do not know, and I say where the evidence stops.",
      never_means: "That the question is unimportant.",
    },
  };
  if (JSON.stringify(register.marker_policy?.definitions) !== JSON.stringify(expectedPolicy)) {
    fail("claim-register marker policy mismatch");
  }
  if (!Array.isArray(register.sources) || !Array.isArray(register.claims) || register.claims.length !== 62) {
    fail("claim-register collection mismatch");
  }
  const sourceIds = register.sources.map(source => source?.source_id);
  if (sourceIds.some(id => typeof id !== "string") || new Set(sourceIds).size !== sourceIds.length) {
    fail("claim-register source IDs are not unique");
  }
  const sourceById = new Map(register.sources.map(source => [source.source_id, source]));
  for (const [sourceId, source] of sourceById) {
    if (source.kind === "packet_file") {
      if (typeof source.path !== "string" || !source.path || source.path.split(/[\\/]/).includes("..") || /^[A-Za-z]:[\\/]|^\//.test(source.path)) {
        fail(`unsafe packet source path: ${sourceId}`);
      }
      const sourcePath = join(root, source.path);
      if (!manifest.files?.[source.path]) fail(`unbound packet source: ${sourceId}`);
      const data = readFileSync(sourcePath);
      if (source.expected_bytes !== data.length || source.expected_sha256 !== sha256(data)) fail(`packet source identity mismatch: ${sourceId}`);
    } else if (source.kind === "public_git_blob") {
      if (!/^[0-9a-f]{40}$/.test(source.commit || "")) fail(`invalid public commit: ${sourceId}`);
      if (typeof source.path !== "string" || !source.path) fail(`missing public path: ${sourceId}`);
      if (!Number.isInteger(source.expected_bytes) || source.expected_bytes <= 0) fail(`invalid public byte count: ${sourceId}`);
      if (!/^[0-9a-f]{64}$/.test(source.expected_sha256 || "")) fail(`invalid public digest: ${sourceId}`);
    } else if (source.kind === "public_git_tree") {
      if (!/^[0-9a-f]{40}$/.test(source.commit || "") || !/^[0-9a-f]{40}$/.test(source.tree || "")) fail(`invalid public tree identity: ${sourceId}`);
    } else if (source.kind === "retained_digest") {
      if (!Number.isInteger(source.expected_bytes) || source.expected_bytes <= 0) fail(`invalid retained byte count: ${sourceId}`);
      if (!/^[0-9a-f]{64}$/.test(source.expected_sha256 || "")) fail(`invalid retained digest: ${sourceId}`);
    } else if (source.kind === "paper_context") {
      if (source.verification_status !== "NOT_EVIDENCE") fail("paper context was promoted to evidence");
    } else {
      fail(`unknown claim source kind: ${sourceId}`);
    }
  }
  const expectedIds = register.claims.map(claim => (claim && typeof claim === "object") ? claim.claim_id : undefined);
  if (!expectedIds.every(id => typeof id === "string" && /^FMOTA-V4-CLM-\d{3}$/.test(id))) fail("malformed claim ID");
  if (new Set(expectedIds).size !== expectedIds.length) fail("duplicate claim IDs");
  const claimIds = [];
  for (const claim of register.claims) {
    if (!claim || typeof claim !== "object" || typeof claim.claim_id !== "string" || typeof claim.claim_text !== "string") {
      fail("claim record identity missing");
    }
    const expectedClaimFields = ["claim_id", "claim_text", "claim_text_sha256", "fragment", "review_questions", "review_source_ids", "scope", "section"];
    if (JSON.stringify(Object.keys(claim).sort()) !== JSON.stringify(expectedClaimFields)) fail(`claim field mismatch: ${claim.claim_id}`);
    if (claim.claim_text_sha256 !== sha256(Buffer.from(claim.claim_text, "utf8"))) {
      fail(`claim text digest mismatch: ${claim.claim_id}`);
    }
    if (!Array.isArray(claim.review_source_ids) || claim.review_source_ids.length === 0 || new Set(claim.review_source_ids).size !== claim.review_source_ids.length || claim.review_source_ids.some(id => !sourceIds.includes(id))) {
      fail(`unregistered review source: ${claim.claim_id}`);
    }
    claimIds.push(claim.claim_id);
  }
  if (JSON.stringify(claimIds) !== JSON.stringify(expectedIds)) fail("claim IDs are incomplete or out of order");

  const registerSha = sha256(readFileSync(join(root, "claims.json")));
  for (const [assignmentSet, role] of [[author, "AUTHOR_KEY"], [reviewer, "EXTERNAL_REVIEW"]]) {
    if (assignmentSet.schema_version !== "fmota-marker-assignments.v1") fail(`unknown marker-assignment schema: ${role}`);
    if (assignmentSet.assignment_role !== role) fail(`marker-assignment role mismatch: ${role}`);
    if (assignmentSet.claim_register_sha256 !== registerSha) fail(`marker-assignment register digest mismatch: ${role}`);
    if (!Array.isArray(assignmentSet.assignments) || JSON.stringify(assignmentSet.assignments.map(item => item?.claim_id)) !== JSON.stringify(expectedIds)) {
      fail(`marker assignments are incomplete or out of order: ${role}`);
    }
    for (const item of assignmentSet.assignments) {
      if (role === "AUTHOR_KEY") {
        const expectedFields = ["ceiling", "claim_id", "marker", "rationale", "relied_on_source_ids", "unavailable_source_ids"];
        if (JSON.stringify(Object.keys(item).sort()) !== JSON.stringify(expectedFields)) fail(`author assignment field mismatch: ${item.claim_id}`);
        if (!markerNames.includes(item.marker) || typeof item.ceiling !== "string" || item.ceiling.length === 0) fail(`invalid author assignment: ${item.claim_id}`);
        const claim = register.claims[expectedIds.indexOf(item.claim_id)];
        if (!Array.isArray(item.relied_on_source_ids) || !Array.isArray(item.unavailable_source_ids)) fail(`invalid author evidence arrays: ${item.claim_id}`);
        if (item.relied_on_source_ids.some(id => !claim.review_source_ids.includes(id))) fail(`author relied on unregistered claim source: ${item.claim_id}`);
        if (item.unavailable_source_ids.some(id => !item.relied_on_source_ids.includes(id))) fail(`author unavailable source is not relied on: ${item.claim_id}`);
        if (["TESTED", "OBSERVED"].includes(item.marker) && !item.relied_on_source_ids.some(id => sourceById.get(id)?.verification_status !== "NOT_EVIDENCE")) {
          fail(`result claim lacks evidence: ${item.claim_id}`);
        }
      } else {
        const expectedFields = ["claim_id", "marker", "rationale", "relied_on_source_ids", "unavailable_source_ids"];
        if (JSON.stringify(Object.keys(item).sort()) !== JSON.stringify(expectedFields)) fail(`reviewer assignment field mismatch: ${item.claim_id}`);
        if (item.marker !== null || item.rationale !== "" || JSON.stringify(item.relied_on_source_ids) !== "[]" || JSON.stringify(item.unavailable_source_ids) !== "[]") {
          fail(`reviewer template is not blank: ${item.claim_id}`);
        }
      }
    }
  }
}

const manifestBytes = readFileSync(manifestPath);
let manifest;
try {
  manifest = JSON.parse(manifestBytes.toString("utf8"));
} catch (error) {
  fail(`manifest unreadable: ${error.message}`);
}
if (manifest.schema !== "accepted-state-owner-review-release.v1") fail("unknown manifest schema");
if (manifest.hash_basis !== "SHA-256 of raw file bytes") fail("unknown hash basis");

rejectCompiledPythonCaches(root);
const actual = files(root);
const expected = Object.keys(manifest.files || {}).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(`allowlist mismatch actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);

const rootParts = [];
for (const path of actual) {
  const data = readFileSync(join(root, path));
  const record = manifest.files[path];
  const fileDigest = sha256(data);
  if (record.bytes !== data.length || record.sha256 !== fileDigest) fail(`byte identity mismatch: ${path}`);
  if (record.status !== "OWNER_REVIEW") fail(`unexpected file status: ${path}`);
  if (typeof record.role !== "string" || record.role.length === 0) fail(`missing role: ${path}`);
  rootParts.push(`${path}\0${fileDigest}\0${data.length}\n`);

  const suffix = extname(path).toLowerCase();
  if (textSuffixes.has(suffix) || path.endsWith("/LICENSE") || ["requirements.txt", ".gitattributes", ".gitignore"].includes(path)) {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(data);
    if (text.includes("\uFFFD") || text.includes("\0")) fail(`invalid text scalar in ${path}`);
    if (path !== "tools/verify_release.py" && path !== "tools/verify-release.mjs") {
      for (const [label, pattern] of privatePatterns) {
        if (pattern.test(text)) fail(`${label} in ${path}`);
      }
    }
    if (/(?:gh[opsu]_|github_pat_)[A-Za-z0-9_]{20,}/.test(text)) fail(`credential-like token in ${path}`);
    if (suffix === ".json") {
      try { JSON.parse(text); } catch (error) { fail(`invalid JSON in ${path}: ${error.message}`); }
    }
  } else if (suffix === ".pdf" && !data.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    fail(`invalid PDF signature: ${path}`);
  }
}

const payloadRoot = sha256(Buffer.from(rootParts.join(""), "utf8"));
if (payloadRoot !== manifest.payload_root) fail("payload root mismatch");

verifyClaimRegister(manifest);

const report = {
  fileCount: actual.length,
  manifestSha256: sha256(manifestBytes),
  payloadRoot,
  status: "PASS",
};
process.stdout.write(`${JSON.stringify(report)}\n`);
