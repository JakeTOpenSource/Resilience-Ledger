# Atlas candidate materialization: boundary note

This is a **proposal-stage, offline transform**, not a dataset migration.

`terms.enriched.json` is treated as one declared *candidate* input. The
materializer can reproduce three consumer-shaped objects without network access
or a model call:

| Profile | Known operation | What it does not establish |
| --- | --- | --- |
| `ask-ground-truth-v1` | Copies terms, relations, and source records. | Whether those records should replace Chat or Ground Truth. |
| `explore-v1` | Copies terms and relations. | Whether the Explore UI accepts all fields or whether a term is correct. |
| `gap-check-v1` | Explicitly maps the named display/matcher fields and relation triples. | Whether the target tool's historical aliases, status labels, or output semantics should change. |

Run the check without changing files:

```text
node governance/harnesses/verify-atlas-data-materialization.js
node governance/harnesses/materialize-atlas-candidate.js --inventory
```

The tool intentionally has no `--write` option. A later accepted migration must
name its source fields, inclusion and status policy, target consumer, exact
output digest, UI corpus evidence, and rollback boundary. The historical Canon
is excluded because its selection policy and non-input identifiers are not yet
declared.
