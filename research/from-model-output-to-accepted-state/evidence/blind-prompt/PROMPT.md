# Blind Prompt BP-001

Use only the facts below. Do not browse, inspect other files, or assume a named
research framework. Return one JSON object matching the supplied schema. Do
not use Markdown.

A decision system has:

- a deterministic gate `g` in `PASS`, `HOLD`, or `FAIL`;
- a binary future event `Y` with true rate `q = 1/2`;
- an issued forecast `p` selected from `0, 1/4, 1/2, 3/4, 1`;
- binary Brier loss `E[(p - Y)^2]`;
- a second, coupled objective `F(p) = E[(p - Y)^2] + (1/2)p`;
- a later observation that may still be pending;
- two histories, `[]` and `[ACCEPT(0)]`, both projected to current value `0`;
- the query `everAccepted`, which is false for the first history and true for
  the second;
- three candidate actions with risk vectors to minimize:
  `A = (safety 0.1, heat 0.8)`,
  `B = (safety 0.3, heat 0.4)`, and
  `C = (safety 0.6, heat 0.2)`;
- no authorized weights or priority ordering between safety and heat.

Rules:

1. Execution is permitted only when the deterministic gate is `PASS`.
2. A pending observation is not zero, false, success, or failure.
3. Pareto dominance means no worse in every risk component and strictly better
   in at least one.
4. A forecast must be fixed before its outcome is observed if it is to be
   scored as a forecast.
5. Different encodings that preserve exactly the same declared behavior may be
   treated as one behavioral class.

Answer the finite questions exactly, then explain the smallest auditable
architecture you would use. The explanation must distinguish issued output,
realized outcome, deterministic gate state, forecast scoring, and calibration.
It must also state one limitation.

