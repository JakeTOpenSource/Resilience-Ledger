import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "release-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function portable(path) {
  return path.split(sep).join("/");
}

function files(directory) {
  const output = [];
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === "node_modules") continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...files(absolute));
    else if (entry.isFile()) output.push(portable(relative(root, absolute)));
  }
  return output;
}

function normalizedBytes(path) {
  return Buffer.from(readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n"), "utf8");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

if (manifest.schema_version !== "public-release-manifest.v1") throw new Error("unknown release manifest schema");
if (manifest.hash_basis !== "SHA-256 of UTF-8 file bytes with CRLF normalized to LF") throw new Error("unknown release hash basis");

const actual = files(root).filter((path) => path !== "release-manifest.json").sort();
const allowed = Object.keys(manifest.files).sort();
if (JSON.stringify(actual) !== JSON.stringify(allowed)) {
  throw new Error(`release allowlist mismatch\nactual=${JSON.stringify(actual)}\nmanifest=${JSON.stringify(allowed)}`);
}

const forbiddenExtensions = new Set([".docx", ".pdf", ".png", ".jpg", ".jpeg", ".gif", ".zip", ".env", ".pem", ".key"]);
const forbiddenLiterals = [
  "delta-atlas-" + "signal-lab",
  "Resilience-Ledger-" + "archive",
  "owner Downloads " + "tree",
  "2026-08-09 research " + "workspace",
  "codex-" + "runtimes",
  "C:" + "/Users/",
  "C:" + "\\Users\\",
  ".codex" + "/attachments",
  "gh" + "o_"
];

for (const path of actual) {
  const extension = path.includes(".") ? path.slice(path.lastIndexOf(".")).toLowerCase() : "";
  if (forbiddenExtensions.has(extension)) throw new Error(`${path}: forbidden public extension`);
  const bytes = normalizedBytes(path);
  const expected = manifest.files[path];
  if (expected.sha256 !== sha256(bytes) || expected.byte_length !== bytes.length) {
    throw new Error(`${path}: release digest or byte length mismatch`);
  }
  const text = bytes.toString("utf8");
  if (/[A-Za-z]:[\\/](?:Users|Documents|Downloads|AppData)[\\/]/.test(text)) throw new Error(`${path}: absolute local path pattern`);
  if (/gh[opsu]_[A-Za-z0-9]{20,}/.test(text)) throw new Error(`${path}: credential-like GitHub token pattern`);
  for (const literal of forbiddenLiterals) if (text.includes(literal)) throw new Error(`${path}: forbidden boundary literal ${literal}`);
}

const sources = JSON.parse(readFileSync(join(root, "sources.json"), "utf8"));
if (!sources.sources.every((source) => ["CONTENT_CHECKED", "VERSION_CHECKED"].includes(source.verification_state))) {
  throw new Error("source register contains an unchecked source");
}

process.stdout.write(`public release manifest: ${actual.length} allowlisted files, privacy boundary: PASS\n`);
