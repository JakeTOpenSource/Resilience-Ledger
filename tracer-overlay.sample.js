/**
 * tracer-overlay.sample.js — TEMPLATE for a private seed-frame overlay.
 *
 * To use: copy this file to  tracer-overlay.local.js  (same folder) and fill in your
 * domain's phrases. The .local.js name matters: .gitignore blocks it, so your hardened
 * lexicon can never be committed or leak through a public fork. Never rename it to
 * something committable, and never share reports without remembering that findings
 * quote matched phrases — published output can reveal private tripwires.
 *
 * The overlay can only ADD phrases to the public lexicon. It cannot remove or weaken
 * the public floor — by design: a private layer that could subtract from the floor
 * would be an escape hatch, and you know the rule about those.
 *
 * Works in three places, same file:
 *   - Delta-Atlas-Tracer.html loads it automatically if present (one harmless 404 if not)
 *   - node delta-atlas-cli.js trace file.txt --overlay tracer-overlay.local.js
 *   - node tracer-corpus.js --overlay tracer-overlay.local.js   (for private corpora)
 *
 * Hardening loop (State-Delta, applied to the lexicon itself):
 *   1. Your local model PROPOSES phrases from your own logs — it never edits this file.
 *   2. You run the corpus (must stay green) — the deterministic gate.
 *   3. You cold-read and paste the survivors here, with a dated note below.
 * Keep this file outside any model's write path. The floor is not writable by the
 * loop it governs — that applies to files too.
 *
 * License note: this TEMPLATE is CC BY 4.0; your filled-in .local.js copy is yours alone.
 */
globalThis.TRACER_OVERLAY = {
  // Bump when you change anything below; shown in the tool as "base + private overlay <version>".
  version: "0.1",

  // Nouns your domain uses for binding limits (join the public rule/limit/threshold family).
  // Example: "tether", "dose ceiling", "exposure cap"
  constraintNouns: [],

  // Verbs that BREAK a limit in your domain's dialect.
  overrideVerbs: [],

  // Words your domain uses for the mission/objective being served.
  missionNouns: [],

  // Verbs that CHANGE a limit rather than break it (raise/extend family).
  boundaryVerbs: [],

  // Verbs that offer a justification (justifies/warrants family).
  justificationVerbs: [],

  // Authorities genuinely empowered to amend your references (their mutation reads as
  // amendment, not drift). CAUTION - this list RECLASSIFIES findings: a phrase here turns
  // matching drift into amendment, so a wrong entry SUPPRESSES detections. Add sparingly,
  // only real ones, corpus-gate them, and never accept a model-proposed entry here
  // without a second cold read.
  externalAuthorities: [],

  // Names your own loop goes by (its self-amendments read as drift).
  internalAgents: [],

  // Your domain's soft words for a breach ("recalibration" family). Remember: this list
  // is a labeled fallback, one thesaurus-hop from evasion. If a phrase you add here turns
  // out to be STRUCTURAL (it catches the shape of a move, not your domain's words),
  // consider sending that part back to the public repo.
  euphemisms: [],

  // Phrases your logs use to declare a binding invariant (the anchor the tracer
  // extracts reference terms from). CAUTION - anchor matches are credited as "held"
  // and grace precedence means a unit that matches here is NOT also accused, so an
  // over-broad phrase can mask drift in the same line. Keep these specific
  // (multi-word declarations, not single common words), and corpus-gate them.
  anchorMarkers: []

  // Private re-derivation log — controlled drift, even in private:
  // 2026-__-__  added "____" to ____ because ____ (corpus green, cold-read done)
};
