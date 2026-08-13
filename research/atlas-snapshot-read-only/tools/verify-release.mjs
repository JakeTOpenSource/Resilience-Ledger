import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageRoot, "..", "..");
const packagePrefix = "research/atlas-snapshot-read-only/";
const historyRelative = `${packagePrefix}release-history-pr6.v1.json`;
const historyRecord = JSON.parse(readFileSync(join(repositoryRoot, historyRelative), "utf8"));
const manifestRelative = `${packagePrefix}release-manifest.json`;
const verifierRelative = `${packagePrefix}tools/verify-release.mjs`;
const lifecycleDecisionRelative = "governance/decision-log/0007-git-pages-source-hardening.md";
const governanceValidatorRelative = "governance/governance-validate.js";
const lifecycleEventRelative = "governance/ledger/events/governance/000006-git-pages-source-hardening-authorized.json";
const lifecycleCheckpointRelative = "governance/ledger/checkpoints/checkpoint-000007.json";
const expectedDiff = [
  ["M", ".github/workflows/gates.yml"],
  ["M", "README.md"],
  ["A", "Six-Signal-Method.html"],
  ["A", "_headers"],
  ["A", "governance/decision-log/0005-six-signal-public-method-release.md"],
  ["A", "governance/decision-log/0006-six-signal-release-binding-correction.md"],
  ["M", "governance/harnesses/run-all.js"],
  ["A", "governance/harnesses/verify-six-signal-surface.js"],
  ["A", "governance/ledger/checkpoints/checkpoint-000005.json"],
  ["A", "governance/ledger/checkpoints/checkpoint-000006.json"],
  ["A", "governance/ledger/events/governance/000004-six-signal-public-method-authorized.json"],
  ["A", "governance/ledger/events/governance/000005-six-signal-release-binding-corrected.json"],
  ["A", `${packagePrefix}README.md`],
  ["A", manifestRelative],
  ["A", `${packagePrefix}snapshot-card.json`],
  ["A", `${packagePrefix}tools/verify-release.mjs`]
];
const expectedReleasePaths = [
  ".github/workflows/gates.yml",
  "README.md",
  "Six-Signal-Method.html",
  "_headers",
  "governance/harnesses/run-all.js",
  "governance/harnesses/verify-six-signal-surface.js",
  `${packagePrefix}README.md`,
  `${packagePrefix}snapshot-card.json`,
  `${packagePrefix}tools/verify-release.mjs`
];
const expectedSourcePaths = [
  "governance/artifact-register.json",
  "governance/authority-map.json",
  "governance/deployment-receipts/2026-08-11-current-production.json",
  "governance/ledger/checkpoints/checkpoint-000004.json",
  "governance/ledger/events/research/000001-wp0-artifact-search.json",
  "governance/ledger/events/semantics/000001-status-vocabulary-boundary.json",
  "governance/status-vocabulary-contract.json"
];
const forbiddenExtensions = new Set([".docx", ".pdf", ".png", ".jpg", ".jpeg", ".gif", ".zip", ".env", ".pem", ".key"]);
const forbiddenLiterals = [
  "delta-atlas-" + "signal-lab",
  "codex-" + "runtimes",
  "C:" + "/Users/",
  "C:" + "\\Users\\",
  ".codex" + "/attachments",
  "gh" + "o_"
];

function git(args, encoding = "utf8") {
  try {
    return execFileSync("git", ["-c", `safe.directory=${repositoryRoot}`, ...args], {
      cwd: repositoryRoot,
      encoding,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    const detail = error.stderr ? error.stderr.toString("utf8").trim() : error.message;
    throw new Error(`git ${args.join(" ")} failed: ${detail}`);
  }
}

function gitBytes(ref, path) {
  return git(["show", `${ref}:${path}`], null);
}

function normalized(bytes) {
  return Buffer.from(bytes.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function canonicalize(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("canonical JSON refuses non-finite numbers");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  }
  throw new Error(`canonical JSON refuses ${typeof value}`);
}

function hashValue(value) {
  return sha256(Buffer.from(canonicalize(value), "utf8"));
}

function eventHash(event) {
  const material = {};
  for (const [key, value] of Object.entries(event)) if (key !== "event_hash") material[key] = value;
  return hashValue(material);
}

function exactSet(actual, expected, label) {
  const left = [...actual].sort();
  const right = [...expected].sort();
  if (new Set(left).size !== left.length || JSON.stringify(left) !== JSON.stringify(right)) throw new Error(`${label} mismatch`);
}

function exactPairs(actual, expected, label) {
  const sort = (entries) => entries.map((entry) => [...entry]).sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));
  if (JSON.stringify(sort(actual)) !== JSON.stringify(sort(expected))) throw new Error(`${label} mismatch`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function scanPublicText(path, bytes) {
  if (forbiddenExtensions.has(extname(path).toLowerCase())) throw new Error(`${path}: forbidden public extension`);
  const text = bytes.toString("utf8");
  if (/[A-Za-z]:[\\/](?:Users|Documents|Downloads|AppData)[\\/]/.test(text)) throw new Error(`${path}: absolute local path pattern`);
  if (/gh[opsu]_[A-Za-z0-9]{20,}/.test(text)) throw new Error(`${path}: credential-like GitHub token pattern`);
  for (const literal of forbiddenLiterals) if (text.includes(literal)) throw new Error(`${path}: forbidden boundary literal`);
}

function matchesRecord(record, bytes) {
  return Boolean(record) && record.sha256 === sha256(bytes) && record.byte_length === bytes.length;
}

function worktreeBytes(path) {
  return normalized(readFileSync(join(repositoryRoot, path)));
}

assert(historyRecord.schema_version === "public-release-history.v1", "unknown release-history schema");
assert(historyRecord.classification === "PUBLIC", "release-history classification mismatch");
assert(historyRecord.purpose === "VERIFY_IMMUTABLE_HISTORICAL_RELEASE", "release-history purpose mismatch");
assert(historyRecord.hash_basis === "SHA-256 of UTF-8 file bytes with CRLF normalized to LF", "unknown release hash basis");
exactSet(historyRecord.claim_ceiling, [
  "HISTORICAL_PR6_BYTE_IDENTITY_ONLY",
  "NOT_CURRENT_RELEASE_SCOPE",
  "NOT_FUTURE_PULL_REQUEST_SCOPE",
  "NOT_DEPLOYMENT_IDENTITY",
  "NOT_LIVE_HEALTH",
  "NOT_RELEASE_OR_EFFECT_AUTHORITY"
], "release-history claim ceiling");

const history = historyRecord.historical_release;
assert(history.release_manifest_path === manifestRelative, "historical release-manifest path mismatch");
assert(history.release_id === "six-signal-public-method-and-card-0002", "historical release id mismatch");
assert(history.base_commit === "9802e5460248c69d2b08049182a36994f9a660e0", "historical base commit mismatch");
assert(history.head_commit === "02d346b7cce4b489667cafde7dcf049337403779", "historical head commit mismatch");
assert(history.merge_commit === "6ce4bb033fb7bbb6289faae7dc6f8e67bb1998b1", "historical merge commit mismatch");
exactSet(history.merge_parents, [history.base_commit, history.head_commit], "historical merge parents");
exactPairs(history.exact_diff.map((entry) => [entry.status, entry.path]), expectedDiff, "historical exact diff record");
exactSet(history.release_file_paths, expectedReleasePaths, "historical release file record");

for (const ref of [history.base_commit, history.head_commit, history.merge_commit]) git(["cat-file", "-e", `${ref}^{commit}`]);
const actualParents = git(["rev-list", "--parents", "-n", "1", history.merge_commit]).trim().split(/\s+/).slice(1);
assert(JSON.stringify(actualParents) === JSON.stringify(history.merge_parents), "historical merge parent order mismatch");
assert(git(["rev-parse", `${history.merge_commit}^{tree}`]).trim() === git(["rev-parse", `${history.head_commit}^{tree}`]).trim(),
  "historical merge tree does not equal the accepted PR head tree");

const actualDiff = [];
const diff = git(["diff", "--name-status", "--find-renames", history.base_commit, history.head_commit, "--"]).trim();
for (const line of diff ? diff.split(/\r?\n/) : []) {
  const parts = line.split("\t");
  if (!/^[AM]$/.test(parts[0]) || parts.length !== 2) throw new Error(`historical release contains unsupported Git change: ${line}`);
  actualDiff.push([parts[0], parts[1].replace(/\\/g, "/")]);
}
exactPairs(actualDiff, expectedDiff, "historical PR6 diff");

const oldManifestBytes = normalized(gitBytes(history.head_commit, manifestRelative));
assert(sha256(oldManifestBytes) === history.release_manifest_sha256, "historical release-manifest digest mismatch");
const oldManifest = JSON.parse(oldManifestBytes.toString("utf8"));
assert(oldManifest.schema_version === "public-release-manifest.v2", "historical manifest schema mismatch");
assert(oldManifest.release_id === history.release_id, "historical manifest release id mismatch");
exactSet(Object.keys(oldManifest.files), expectedReleasePaths, "historical exact release set");

for (const path of expectedReleasePaths) {
  const listing = git(["ls-tree", history.head_commit, "--", path]).trim();
  assert(/^(100644|100755) blob [0-9a-f]{40}\t/.test(listing), `${path}: historical entry is missing or not a regular Git file`);
  const bytes = normalized(gitBytes(history.head_commit, path));
  assert(matchesRecord(oldManifest.files[path], bytes), `${path}: historical release digest or byte length mismatch`);
  scanPublicText(path, bytes);
}

const oldPackageEntries = git(["ls-tree", "-r", "--name-only", history.head_commit, "--", packagePrefix]).trim().split(/\r?\n/).filter(Boolean);
exactSet(oldPackageEntries, [...expectedReleasePaths.filter((path) => path.startsWith(packagePrefix)), manifestRelative],
  "historical public package tree");

const eventBytes = normalized(gitBytes(history.head_commit, history.authorization_event_ref));
const checkpointBytes = normalized(gitBytes(history.head_commit, history.checkpoint_ref));
const event = JSON.parse(eventBytes.toString("utf8"));
const checkpoint = JSON.parse(checkpointBytes.toString("utf8"));
assert(event.event_id === "evt_governance_six_signal_release_binding_0005" && event.decision === "CORRECT",
  "historical correction event mismatch");
exactSet(event.correction_of, ["evt_governance_six_signal_public_method_0004"], "historical correction target");
assert(event.payload.release_manifest_sha256 === history.release_manifest_sha256, "historical event manifest digest mismatch");
const manifestEvidence = event.evidence_refs.find((ref) => ref.source_locator === manifestRelative);
assert(manifestEvidence?.sha256 === history.release_manifest_sha256, "historical release manifest evidence binding mismatch");
assert(eventHash(event) === event.event_hash && hashValue(event.payload) === event.payload_hash, "historical correction event hash mismatch");
assert(checkpoint.event_files[history.authorization_event_ref] === sha256(eventBytes),
  "historical checkpoint does not seal correction event bytes");
const checkpointMaterial = { ...checkpoint };
delete checkpointMaterial.checkpoint_root;
assert(hashValue(checkpointMaterial) === checkpoint.checkpoint_root, "historical checkpoint root mismatch");

const card = JSON.parse(gitBytes(history.head_commit, `${packagePrefix}snapshot-card.json`).toString("utf8"));
assert(card.schema_version === "delta-atlas-public-snapshot-card.v1", "historical snapshot card schema mismatch");
assert(card.classification === "PUBLIC" && card.status === "PROPOSED_REPRODUCTION_CARD", "historical snapshot card status mismatch");
exactSet(card.mode, ["PINNED", "READ_ONLY", "NON_LIVE"], "historical snapshot mode");
assert(card.source.repository === "https://github.com/JakeTOpenSource/Resilience-Ledger" &&
  card.source.commit === history.base_commit, "historical snapshot source binding mismatch");
assert(card.result_claim === "NOT_RECORDED", "historical snapshot card must not publish a result");
exactSet(card.selected_files.map((entry) => entry.path), expectedSourcePaths, "historical selected source paths");
for (const entry of card.selected_files) {
  assert(/^[0-9a-f]{40}$/.test(entry.git_blob_sha1) && /^[0-9a-f]{64}$/.test(entry.sha256) &&
    Number.isInteger(entry.byte_length) && entry.byte_length > 0, `${entry.path}: invalid source identity`);
  const objectId = git(["rev-parse", `${history.base_commit}:${entry.path}`]).trim();
  const bytes = gitBytes(history.base_commit, entry.path);
  assert(objectId === entry.git_blob_sha1 && sha256(bytes) === entry.sha256 && bytes.length === entry.byte_length,
    `${entry.path}: pinned source byte identity mismatch`);
}

for (const path of ["Six-Signal-Method.html", "_headers", "README.md"]) {
  const changed = Buffer.concat([normalized(gitBytes(history.head_commit, path)), Buffer.from("\nsynthetic-tamper", "utf8")]);
  assert(!matchesRecord(oldManifest.files[path], changed), `${path}: historical tamper canary was not rejected`);
}

const lifecycleWriteSet = [
  "Six-Signal-Method.html",
  "_headers",
  governanceValidatorRelative,
  "governance/harnesses/verify-six-signal-surface.js",
  "index.html",
  historyRelative,
  verifierRelative,
  "sw.js"
];
const lifecycleEvidencePaths = [
  "Six-Signal-Method.html",
  lifecycleDecisionRelative,
  "_headers",
  "index.html",
  "sw.js",
  "governance/harnesses/verify-six-signal-surface.js",
  governanceValidatorRelative,
  historyRelative,
  verifierRelative,
  manifestRelative
];
const lifecycleEventBytes = worktreeBytes(lifecycleEventRelative);
const lifecycleEvent = JSON.parse(lifecycleEventBytes.toString("utf8"));
const lifecycleCheckpoint = JSON.parse(worktreeBytes(lifecycleCheckpointRelative).toString("utf8"));
const lifecycleBytes = new Map(lifecycleEvidencePaths.map((path) => [path, worktreeBytes(path)]));
assert(sha256(lifecycleBytes.get(manifestRelative)) === history.release_manifest_sha256,
  "current release-manifest bytes do not preserve the accepted PR6 manifest");
assert(lifecycleEvent.event_id === "evt_governance_git_pages_source_hardening_0006" && lifecycleEvent.decision === "ACCEPT_WITH_LIMITS",
  "release-history lifecycle event mismatch");
assert(lifecycleEvent.authority_ref === lifecycleDecisionRelative && lifecycleEvent.effect?.kind === "NONE",
  "release-history lifecycle authority or effect boundary mismatch");
assert(lifecycleEvent.payload?.history_profile_id === historyRecord.record_id &&
  lifecycleEvent.payload?.future_pull_request_diff_enforcement === false &&
  lifecycleEvent.payload?.deployment_status === "NOT_ATTEMPTED", "release-history lifecycle payload boundary mismatch");
exactSet(lifecycleEvent.write_set, lifecycleWriteSet, "source-hardening lifecycle write set");
exactSet(lifecycleEvent.evidence_refs.map((reference) => reference.source_locator), lifecycleEvidencePaths,
  "source-hardening lifecycle evidence locator set");
const lifecycleEvidence = new Map(lifecycleEvent.evidence_refs.map((reference) => [reference.source_locator, reference.sha256]));
function lifecycleEvidenceHolds(path, bytes) {
  return lifecycleEvidence.get(path) === sha256(bytes);
}
for (const path of lifecycleEvidencePaths) {
  assert(lifecycleEvidenceHolds(path, lifecycleBytes.get(path)), `${path}: lifecycle evidence digest mismatch`);
}
const lifecycleProductPaths = [
  "Six-Signal-Method.html",
  "_headers",
  "index.html",
  "sw.js",
  "governance/harnesses/verify-six-signal-surface.js"
];
for (const path of lifecycleProductPaths) {
  const changed = Buffer.concat([lifecycleBytes.get(path), Buffer.from("\nsynthetic-lifecycle-tamper", "utf8")]);
  assert(!lifecycleEvidenceHolds(path, changed), `${path}: lifecycle product tamper canary was not rejected`);
}
assert(eventHash(lifecycleEvent) === lifecycleEvent.event_hash && hashValue(lifecycleEvent.payload) === lifecycleEvent.payload_hash,
  "release-history lifecycle event hash mismatch");
assert(lifecycleCheckpoint.event_files[lifecycleEventRelative] === sha256(lifecycleEventBytes),
  "lifecycle checkpoint does not seal the release-history event bytes");
const lifecycleCheckpointMaterial = { ...lifecycleCheckpoint };
delete lifecycleCheckpointMaterial.checkpoint_root;
assert(hashValue(lifecycleCheckpointMaterial) === lifecycleCheckpoint.checkpoint_root, "lifecycle checkpoint root mismatch");
for (const [path, bytes] of lifecycleBytes) scanPublicText(path, bytes);
scanPublicText(lifecycleEventRelative, lifecycleEventBytes);

process.stdout.write(
  `historical public release: PR6 ${expectedDiff.length} exact paths from ${history.base_commit.slice(0, 12)} to ${history.head_commit.slice(0, 12)}; ` +
  `${expectedReleasePaths.length} immutable release files; ${expectedSourcePaths.length} pinned public source objects; ` +
  `append-only lifecycle event/checkpoint bound; 3 historical and ${lifecycleProductPaths.length} lifecycle product tamper canaries: PASS\n`
);
