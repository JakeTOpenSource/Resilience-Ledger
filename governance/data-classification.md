# Delta Atlas data classification and egress boundary

**Status:** ACCEPT_WITH_LIMITS

**Effective:** 2026-08-11

**Owner evidence:** repository owner direction to proceed with Work Packet 0

**Contractual controls:** UNKNOWN until separately documented

This policy is the operational floor for research and repository work. It does
not claim that current product, account, legal, retention, or jurisdiction
settings satisfy a contractual no-egress requirement.

## Required classification

Every input receives one class before processing:

### PUBLIC

Material approved for public release, including public repository source,
published site content, public standards, and deliberately public research.

Allowed destinations: public repository, public issue or pull request, public
CI output, browser, public documentation search, and approved external tools.

### INTERNAL

Non-public working material whose disclosure is not expected to cause serious
harm but has not been approved for publication.

Allowed destinations: approved local workspace, private repository, and an
approved processor required for the task. Public search, public issues, public
CI artifacts, and public receipts are denied.

### RESTRICTED

Secrets, credentials, private corpora, personal or regulated data, unpublished
sensitive research, private invariants, private server manifests, and material
with contractual or legal constraints.

Allowed destinations: only the explicitly approved restricted workspace or
store. External processing is denied until the owner records the processor,
purpose, retention, jurisdiction, and access decision.

## Boundary rules

1. Unclassified material is treated as RESTRICTED.
2. Public and non-public repositories use separate clones, worktrees, caches,
   output directories, and CI contexts.
3. Private repository contents are not copied into browser automation, web
   search, public GitHub queries, public issues, or Cloudflare documentation
   queries.
4. A public receipt may say that private evidence exists only when disclosure
   is authorized. It must not contain private content, local paths, raw private
   hashes, filenames that reveal protected facts, prompts, or secret-bearing
   logs.
5. If a cross-boundary commitment is required, design an opaque identifier or
   keyed commitment. A plain hash is not automatically anonymous.
6. `*.local.js` and `*.local.json` remain non-public. `.gitignore` is a
   convenience barrier, not sufficient enforcement.
7. Secrets are never committed. If exposure is suspected, stop publication,
   rotate or revoke the secret, preserve an incident receipt, and remove the
   material from reachable history through an approved remediation.
8. Agent and CI access is least privilege and task-bound. No adapter receives
   production write authority merely because it can read the repository.
9. Logs record identifiers, decisions, and outcomes; they do not echo private
   payloads by default.
10. Classification changes require a new decision record. They are not silent
    metadata edits.

## Publication gate

Before material crosses from INTERNAL or RESTRICTED to PUBLIC, record:

- accountable owner and authority basis;
- exact artifact identity and approved version;
- rights, license, consent, and attribution review;
- redaction and secret-scan results;
- data-retention and processor implications;
- decision: ACCEPT, ACCEPT_WITH_LIMITS, DEFER, REJECT, or SUPERSEDE.

## Current unknowns

- Whether Codex, GitHub, Cloudflare, or future evaluation/observability
  providers are subject to a required zero-data-retention agreement.
- Whether future research contains human-subject, personal, licensed,
  regulated, export-controlled, or jurisdiction-limited data.
- The required retention period and deletion authority for private artifacts.

Until those are answered, this operational policy prevents public disclosure
but does not claim contractual compliance.
