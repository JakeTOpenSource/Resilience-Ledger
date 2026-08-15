import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "release-manifest.json");
const textSuffixes = new Set([".cff", ".html", ".json", ".md", ".mjs", ".ps1", ".py", ".svg", ".txt"]);

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

const manifestBytes = readFileSync(manifestPath);
let manifest;
try {
  manifest = JSON.parse(manifestBytes.toString("utf8"));
} catch (error) {
  fail(`manifest unreadable: ${error.message}`);
}
if (manifest.schema !== "accepted-state-owner-review-release.v1") fail("unknown manifest schema");
if (manifest.hash_basis !== "SHA-256 of raw file bytes") fail("unknown hash basis");

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
  if (textSuffixes.has(suffix) || path.endsWith("/LICENSE") || path === "requirements.txt") {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(data);
    if (text.includes("\uFFFD") || text.includes("\0")) fail(`invalid text scalar in ${path}`);
    if (/[A-Za-z]:[\\/](?:Users|Documents|Downloads|AppData)[\\/]/.test(text)) fail(`absolute local path in ${path}`);
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

const report = {
  fileCount: actual.length,
  manifestSha256: sha256(manifestBytes),
  payloadRoot,
  status: "PASS",
};
process.stdout.write(`${JSON.stringify(report)}\n`);
