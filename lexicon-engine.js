// lexicon-engine.js — the shared, deterministic detection engine behind Gap Check and
// (new) the Continuity Audit. One engine, two knowledge bases, two outputs —
// the point of building this upstream instead of copy-pasting a second Gap Check.
//
// Zero dependencies. Pure functions: no DOM, no fetch, no state. Runs identically in a
// browser (classic <script src="lexicon-engine.js">, no ES-module CORS issues on file://)
// or in Node (require('./lexicon-engine.js')). Everything lives inside one IIFE so a
// classic script tag leaks nothing to global scope except `window.LexiconEngine` — a
// consuming page's own local `analyze(text)` wrapper can exist right next to this
// without a top-level `function analyze(){}` collision.
//
// A knowledge base (KB) supplies the DATA; this file supplies the DETECTION LOGIC:
//   KB.terms      — [{ id, aliases:[...], purpose, cluster, acct, name, def, status }, ...]
//   KB.relations  — [[fromId, toId, relType], ...]   e.g. ["guardrail","prompt-injection","mitigates"]
//   KB.defendRelTypes — Set of relation types that count as "X defends against Y"
//   KB.bridge     — { termId: ["everyday phrase", ...] }  credit a term when its plain-language
//                   meaning appears, the same way a direct alias does
//   KB.redFlags   — [{ t, d, re, need? }, ...]  regex red flags, independent of the term graph
//   KB.groupChecks — [{ sev, title(byId,M), detail(byId,M), sugg, ifGroup, unlessGroup, elseIf }, ...]
//                    generalizes "autonomy present, no oversight present" into any
//                    "if group A is present and group B is absent, that's a gap" rule.
//                    ifGroup/unlessGroup: { ids?: Set<string>, clusters?: Set<string> }
//                    elseIf (optional): { test(byId,M,found), sev, title, detail, sugg } — fires
//                    instead when both groups are present but a finer custom check still fails
//                    (Gap Check's own example: agentic + oversight present, but no accountable
//                    owner named).
//   KB.clusters   — [clusterName, ...]  for the coverage/missing-areas rollup
//
// NEG guard (unchanged from the fix earlier this project's life): a term is not credited
// as present if the ~32 characters before the match negate it, so "no human-in-the-loop"
// or "without any guardrail" don't count the control as present. Same vocabulary covers
// direct alias hits and bridge crosswalk cues — that symmetry was the whole point of the fix.

(function (root, factory) {
  const mod = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = mod;
  else root.LexiconEngine = mod;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const NEG = /\b(no|not|without|never|prevent\w*|disabl\w*|lock\w*|bypass\w*|cannot|can.?t|remov\w*|block\w*|forbid\w*|deny|denied|too slow|instead of)\b/;
  // CANCELLATION: a control named only to say it was scrapped / never existed must NOT count as
  // present. The old guard only looked BEFORE the match, so post-noun cancellation ("succession
  // plan but we scrapped it", "confidentiality agreement was never signed") slipped through and
  // silenced the very risk that control defends. Checked on both sides of the match now.
  const CANCEL = /\b(scrap\w*|cancel\w*|discontinu\w*|terminat\w*|no longer|used to|former\w*|expir\w*|undone|lapsed|never (signed|trained|had|set up|implemented|got|established)|was never|is not in place)\b/;
  // dt/t strings intentionally carry literal HTML (e.g. "<b>") mixed with dynamic term
  // names, so the dynamic parts get escaped here — a consuming page must not re-escape.
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

  function norm(s) { return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim(); }

  function inGroup(id, byId, spec) {
    if (!spec) return false;
    if (spec.ids && spec.ids.has(id)) return true;
    if (spec.clusters && byId[id] && spec.clusters.has(byId[id].cluster)) return true;
    return false;
  }

  // detect(text, KB) -> Set<termId> of everything the text credits as present
  function detect(text, KB) {
    text = String(text == null ? "" : text);
    const nt = " " + norm(text) + " ";
    const hit = {};
    // allowCancel: cancellation ("scrapped", "was never signed") only ever REMOVES a control
    // credit — never silences a risk. A cancel-word bleeding across a clause boundary onto a
    // risk would silently drop a real hazard (the dangerous direction); onto a control it just
    // over-flags a gap (the safe direction). So risks use the plain NEG guard only.
    const present = (needle, allowCancel) => {
      let ix = nt.indexOf(needle);
      while (ix >= 0) {
        const pre = nt.slice(Math.max(0, ix + 1 - 32), ix + 1);
        const post = nt.slice(ix + needle.length - 1, ix + needle.length - 1 + 26);
        const cancelled = allowCancel && (CANCEL.test(pre) || CANCEL.test(post));
        if (!NEG.test(pre) && !cancelled) return true;
        ix = nt.indexOf(needle, ix + 1);
      }
      return false;
    };
    for (const t of (KB.terms || [])) {
      if (!Array.isArray(t.aliases)) continue;
      const allowCancel = t.purpose !== "risk";
      for (const a of t.aliases) { if (present(" " + a + " ", allowCancel) || present(" " + a + "s ", allowCancel)) { hit[t.id] = a; break; } }
    }
    const out = new Set();
    const low = text.toLowerCase();
    const bridge = KB.bridge || {};
    const riskIds = new Set((KB.terms || []).filter(t => t.purpose === "risk").map(t => t.id));
    for (const id in bridge) {
      const allowCancel = !riskIds.has(id);
      for (const cue of bridge[id]) {
        let ix = low.indexOf(cue), found = false;
        while (ix >= 0) {
          const pre = low.slice(Math.max(0, ix - 32), ix);
          const post = low.slice(ix + cue.length, ix + cue.length + 26);
          // Match alias cancellation behavior without suppressing named risks.
          const cancelled = allowCancel && (CANCEL.test(pre) || CANCEL.test(post));
          if (!NEG.test(pre) && !cancelled) { found = true; break; }
          ix = low.indexOf(cue, ix + 1);
        }
        if (found) { out.add(id); break; }
      }
    }
    // longest-match suppression: drop a single-word hit if it's part of a matched multiword alias of a different term
    for (const id in hit) {
      const a = hit[id];
      let drop = false;
      if (a.indexOf(" ") < 0) {
        for (const id2 in hit) {
          if (id2 !== id) {
            const a2 = hit[id2];
            if (a2.indexOf(" ") >= 0 && (" " + a2 + " ").indexOf(" " + a + " ") >= 0) { drop = true; break; }
          }
        }
      }
      if (!drop) out.add(id);
    }
    return out;
  }

  function defendersOf(id, relations, defendRelTypes) {
    const s = [];
    for (const r of relations) if (r[1] === id && defendRelTypes.has(r[2])) s.push(r[0]);
    return s;
  }

  // analyze(text, KB) -> { found, M, risks, defended, findings, touched, missing, areas }
  // findings: [{ sev, t, dt, sugg }]  sev: 'gap' | 'warn' | 'info'
  function analyze(text, KB) {
    text = String(text == null ? "" : text);
    KB = KB || {};
    const byId = {};
    // corpus (KB.noControlNoun) names what "records no standard control" — Gap Check keeps its
    // original word "glossary"; a KB that isn't a glossary (the Continuity Audit) passes its own.
    const kbNoun = KB.noControlNoun || "glossary";
    for (const t of (KB.terms || [])) byId[t.id] = t;
    const found = detect(text, KB);
    const M = [...found];
    const relations = KB.relations || [];
    const defendRelTypes = KB.defendRelTypes || new Set();
    const findings = [];

    const risks = M.filter(id => byId[id] && byId[id].purpose === "risk");
    let defended = 0;
    risks.forEach(id => {
      const defs = defendersOf(id, relations, defendRelTypes);
      const present = defs.filter(x => found.has(x));
      if (present.length) { defended++; return; }
      if (defs.length) {
        findings.push({ sev: "gap", t: "Risk named with no control: " + esc(byId[id].name),
          dt: "You raise <b>" + esc(byId[id].name) + "</b> but nothing that defends against it appears in the text.",
          sugg: defs.slice(0, 4) });
      } else {
        findings.push({ sev: "gap", t: "Risk named with no control: " + esc(byId[id].name),
          dt: "You raise <b>" + esc(byId[id].name) + "</b>, and this " + esc(kbNoun) + " records no standard control for it, so make sure your own defense is written down explicitly.",
          sugg: [] });
      }
    });

    for (const gc of (KB.groupChecks || [])) {
      const anyIf = M.some(id => inGroup(id, byId, gc.ifGroup));
      const anyUnless = M.some(id => inGroup(id, byId, gc.unlessGroup));
      if (anyIf && !anyUnless) {
        findings.push({ sev: gc.sev || "gap", t: gc.title(byId, M), dt: gc.detail(byId, M), sugg: (gc.sugg || []).filter(x => byId[x]) });
      } else if (gc.elseIf && anyIf && anyUnless && !gc.elseIf.test(byId, M, found)) {
        findings.push({ sev: gc.elseIf.sev || "warn", t: gc.elseIf.title(byId, M), dt: gc.elseIf.detail(byId, M), sugg: (gc.elseIf.sugg || []).filter(x => byId[x]) });
      }
    }

    const low = text.toLowerCase();
    (KB.redFlags || []).forEach(rf => { if (rf.re.test(low) && (!rf.need || rf.need.test(low))) findings.unshift({ sev: "gap", t: "Red flag: " + rf.t, dt: rf.d, sugg: [] }); });

    const clusters = KB.clusters || [];
    const touched = new Set(M.map(id => byId[id] && byId[id].cluster).filter(Boolean));
    const missing = clusters.filter(c => !touched.has(c));

    return { found, M, risks, defended, findings, touched, missing, areas: touched.size };
  }

  return { detect, analyze, defendersOf, NEG, norm };
});
