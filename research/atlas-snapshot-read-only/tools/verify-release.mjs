import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageRoot, "..", "..");
const packagePrefix = "research/atlas-snapshot-read-only/";
const manifestRelative = `${packagePrefix}release-manifest.json`;
const eventRelative = "governance/ledger/events/governance/000005-six-signal-release-binding-corrected.json";
const checkpointRelative = "governance/ledger/checkpoints/checkpoint-000006.json";
const manifestPath = join(repositoryRoot, manifestRelative);
const cardPath = join(packageRoot, "snapshot-card.json");
const manifestBytes = normalizedRepositoryBytes(manifestRelative);
const manifest = JSON.parse(manifestBytes.toString("utf8"));
const card = JSON.parse(readFileSync(cardPath, "utf8"));
const event = JSON.parse(readFileSync(join(repositoryRoot, eventRelative), "utf8"));
const checkpoint = JSON.parse(readFileSync(join(repositoryRoot, checkpointRelative), "utf8"));
const require = createRequire(import.meta.url);
const ledger = require(join(repositoryRoot, "governance", "ledger", "lib.js"));

function portable(path) {
  return path.split(sep).join("/");
}

function packageEntries(directory) {
  const output = [];
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === "node_modules") continue;
    const absolute = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`${portable(relative(packageRoot, absolute))}: symbolic links are forbidden in the public packet`);
    if (entry.isDirectory()) output.push(...packageEntries(absolute));
    else if (entry.isFile()) output.push(`${packagePrefix}${portable(relative(packageRoot, absolute))}`);
    else throw new Error(`${portable(relative(packageRoot, absolute))}: unsupported package entry type`);
  }
  return output;
}

function normalizedRepositoryBytes(path) {
  return Buffer.from(readFileSync(join(repositoryRoot, path), "utf8").replace(/\r\n/g, "\n"), "utf8");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function git(args, encoding = "utf8") {
  try {
    return execFileSync("git", args, { cwd: repositoryRoot, encoding, stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    const detail = error.stderr ? error.stderr.toString("utf8").trim() : error.message;
    throw new Error(`git ${args[0]} failed: ${detail}`);
  }
}

function tryGit(args) {
  try {
    return git(args).trim();
  } catch (_) {
    return null;
  }
}

function githubEvent() {
  if (!process.env.GITHUB_EVENT_PATH) return {};
  try {
    return JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  } catch (_) {
    return {};
  }
}

function resolveComparisonBase() {
  if (process.env.PUBLIC_RELEASE_BASE_REF) return git(["rev-parse", "--verify", process.env.PUBLIC_RELEASE_BASE_REF]).trim();

  const eventPayload = githubEvent();
  if (process.env.GITHUB_BASE_REF) {
    const remoteBase = tryGit(["merge-base", "HEAD", `origin/${process.env.GITHUB_BASE_REF}`]);
    if (remoteBase) return remoteBase;
    const payloadBase = eventPayload.pull_request?.base?.sha;
    const verifiedPayloadBase = payloadBase && tryGit(["rev-parse", "--verify", payloadBase]);
    if (verifiedPayloadBase) return verifiedPayloadBase;
    return git(["rev-parse", "--verify", "HEAD^1"]).trim();
  }

  const defaultBranch = eventPayload.repository?.default_branch;
  const pushedBranch = eventPayload.ref?.replace(/^refs\/heads\//, "");
  const before = eventPayload.before;
  if (defaultBranch && pushedBranch === defaultBranch && before && !/^0+$/.test(before)) {
    const beforeBase = tryGit(["rev-parse", "--verify", before]);
    if (beforeBase) return beforeBase;
  }
  if (defaultBranch) {
    const defaultBase = tryGit(["merge-base", "HEAD", `origin/${defaultBranch}`]);
    if (defaultBase) return defaultBase;
  }

  const currentBranch = tryGit(["branch", "--show-current"]);
  const remoteHead = tryGit(["symbolic-ref", "--short", "refs/remotes/origin/HEAD"]);
  if (remoteHead && currentBranch !== remoteHead.replace(/^origin\//, "")) {
    const localBase = tryGit(["merge-base", "HEAD", remoteHead]);
    if (localBase) return localBase;
  }
  for (const candidate of ["origin/main", "origin/master"]) {
    const candidateBase = tryGit(["merge-base", "HEAD", candidate]);
    if (candidateBase) return candidateBase;
  }
  return tryGit(["rev-parse", "--verify", "HEAD"]);
}

function exactSet(actual, expected, label) {
  const left = [...actual].sort();
  const right = [...expected].sort();
  if (new Set(left).size !== left.length || JSON.stringify(left) !== JSON.stringify(right)) {
    throw new Error(`${label} mismatch`);
  }
}

function matchesManifest(path, bytes) {
  const expected = manifest.files[path];
  return Boolean(expected) && expected.sha256 === sha256(bytes) && expected.byte_length === bytes.length;
}

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
const authorizedGovernancePaths = [
  "governance/decision-log/0005-six-signal-public-method-release.md",
  "governance/decision-log/0006-six-signal-release-binding-correction.md",
  "governance/ledger/checkpoints/checkpoint-000005.json",
  "governance/ledger/checkpoints/checkpoint-000006.json",
  "governance/ledger/events/governance/000004-six-signal-public-method-authorized.json",
  "governance/ledger/events/governance/000005-six-signal-release-binding-corrected.json"
];
const authorizedPullRequestPaths = [...expectedReleasePaths, manifestRelative, ...authorizedGovernancePaths];

if (manifest.schema_version !== "public-release-manifest.v2") throw new Error("unknown release manifest schema");
if (manifest.hash_basis !== "SHA-256 of UTF-8 file bytes with CRLF normalized to LF") throw new Error("unknown release hash basis");
if (manifest.decision_ref !== "governance/decision-log/0006-six-signal-release-binding-correction.md") throw new Error("release decision binding mismatch");
if (manifest.authorization_event_ref !== eventRelative) throw new Error("release event binding mismatch");
exactSet(Object.keys(manifest.files), expectedReleasePaths, "exact public release set");

const comparisonBase = resolveComparisonBase();
if (!comparisonBase) throw new Error("cannot resolve public release comparison base");
const changedOutput = git(["diff", "--name-status", "--find-renames", comparisonBase, "--"]).trim();
const changedPaths = [];
for (const line of changedOutput ? changedOutput.split(/\r?\n/) : []) {
  const parts = line.split(/\t/);
  const status = parts[0];
  if (!/^[AM]$/.test(status) || parts.length !== 2) throw new Error(`public release contains unsupported Git change: ${line}`);
  changedPaths.push(portable(parts[1]));
}
const untrackedOutput = git(["ls-files", "--others", "--exclude-standard"]).trim();
for (const path of untrackedOutput ? untrackedOutput.split(/\r?\n/) : []) changedPaths.push(portable(path));
exactSet(changedPaths, authorizedPullRequestPaths, "whole pull-request release allowlist");

const actualPackageEntries = packageEntries(packageRoot).sort();
const expectedPackageEntries = [...expectedReleasePaths.filter((path) => path.startsWith(packagePrefix)), manifestRelative].sort();
exactSet(actualPackageEntries, expectedPackageEntries, "public package tree");

const forbiddenExtensions = new Set([".docx", ".pdf", ".png", ".jpg", ".jpeg", ".gif", ".zip", ".env", ".pem", ".key"]);
const forbiddenLiterals = [
  "delta-atlas-" + "signal-lab",
  "codex-" + "runtimes",
  "C:" + "/Users/",
  "C:" + "\\Users\\",
  ".codex" + "/attachments",
  "gh" + "o_"
];

for (const path of expectedReleasePaths) {
  if (forbiddenExtensions.has(extname(path).toLowerCase())) throw new Error(`${path}: forbidden public extension`);
  const bytes = normalizedRepositoryBytes(path);
  if (!matchesManifest(path, bytes)) throw new Error(`${path}: release digest or byte length mismatch`);
  const text = bytes.toString("utf8");
  if (/[A-Za-z]:[\\/](?:Users|Documents|Downloads|AppData)[\\/]/.test(text)) throw new Error(`${path}: absolute local path pattern`);
  if (/gh[opsu]_[A-Za-z0-9]{20,}/.test(text)) throw new Error(`${path}: credential-like GitHub token pattern`);
  for (const literal of forbiddenLiterals) if (text.includes(literal)) throw new Error(`${path}: forbidden boundary literal`);
}

const manifestDigest = sha256(manifestBytes);
if (event.event_id !== "evt_governance_six_signal_release_binding_0005" || event.decision !== "CORRECT") throw new Error("release correction event mismatch");
exactSet(event.correction_of, ["evt_governance_six_signal_public_method_0004"], "release correction target");
if (event.payload.release_manifest_sha256 !== manifestDigest) throw new Error("correction event manifest digest mismatch");
const manifestEvidence = event.evidence_refs.find((ref) => ref.source_locator === manifestRelative);
if (!manifestEvidence || manifestEvidence.sha256 !== manifestDigest) throw new Error("release manifest evidence binding mismatch");
if (ledger.eventHash(event) !== event.event_hash || ledger.hashValue(event.payload) !== event.payload_hash) throw new Error("release correction event hash mismatch");

const eventBytes = normalizedRepositoryBytes(eventRelative);
if (checkpoint.event_files[eventRelative] !== sha256(eventBytes)) throw new Error("checkpoint does not seal the release correction event bytes");
const checkpointMaterial = { ...checkpoint };
delete checkpointMaterial.checkpoint_root;
if (ledger.hashValue(checkpointMaterial) !== checkpoint.checkpoint_root) throw new Error("release checkpoint root mismatch");

const pinnedCommit = "9802e5460248c69d2b08049182a36994f9a660e0";
if (card.schema_version !== "delta-atlas-public-snapshot-card.v1") throw new Error("unknown snapshot card schema");
if (card.classification !== "PUBLIC" || card.status !== "PROPOSED_REPRODUCTION_CARD") throw new Error("snapshot card status boundary mismatch");
exactSet(card.mode, ["PINNED", "READ_ONLY", "NON_LIVE"], "snapshot mode");
if (card.source.repository !== "https://github.com/JakeTOpenSource/Resilience-Ledger" || card.source.commit !== pinnedCommit) {
  throw new Error("snapshot source binding mismatch");
}
if (card.result_claim !== "NOT_RECORDED") throw new Error("snapshot card must not publish a result");
exactSet(card.claim_ceiling, [
  "BYTE_IDENTITY_AT_PINNED_PUBLIC_COMMIT_ONLY",
  "NOT_CURRENT_REPOSITORY_STATE",
  "NOT_DEPLOYMENT_IDENTITY",
  "NOT_LIVE_HEALTH",
  "NOT_SEMANTIC_TRUTH",
  "NOT_INDEPENDENT_REPRODUCTION",
  "NOT_PRIVACY_CERTIFICATION",
  "NOT_RELEASE_OR_EFFECT_AUTHORITY"
], "snapshot claim ceiling");

const expectedSourcePaths = [
  "governance/artifact-register.json",
  "governance/authority-map.json",
  "governance/deployment-receipts/2026-08-11-current-production.json",
  "governance/ledger/checkpoints/checkpoint-000004.json",
  "governance/ledger/events/research/000001-wp0-artifact-search.json",
  "governance/ledger/events/semantics/000001-status-vocabulary-boundary.json",
  "governance/status-vocabulary-contract.json"
];
exactSet(card.selected_files.map((entry) => entry.path), expectedSourcePaths, "selected source paths");

for (const entry of card.selected_files) {
  if (!/^[0-9a-f]{40}$/.test(entry.git_blob_sha1) || !/^[0-9a-f]{64}$/.test(entry.sha256) || !Number.isInteger(entry.byte_length) || entry.byte_length < 1) {
    throw new Error(`${entry.path}: invalid source identity`);
  }
  const objectId = git(["rev-parse", `${pinnedCommit}:${entry.path}`]).trim();
  const bytes = git(["show", `${pinnedCommit}:${entry.path}`], null);
  if (objectId !== entry.git_blob_sha1 || sha256(bytes) !== entry.sha256 || bytes.length !== entry.byte_length) {
    throw new Error(`${entry.path}: pinned source byte identity mismatch`);
  }
}

const tamperCanaries = ["Six-Signal-Method.html", "_headers", "README.md"];
for (const path of tamperCanaries) {
  const changed = Buffer.concat([normalizedRepositoryBytes(path), Buffer.from("\nsynthetic-tamper", "utf8")]);
  if (matchesManifest(path, changed)) throw new Error(`${path}: tamper canary was not rejected`);
}

process.stdout.write(`public snapshot release: ${expectedReleasePaths.length} exact release files; ${authorizedPullRequestPaths.length} exact PR paths from ${comparisonBase.slice(0, 12)}; ${card.selected_files.length} pinned public source objects; ${tamperCanaries.length} tamper canaries: PASS\n`);
