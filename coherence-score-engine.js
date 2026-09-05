// coherence-score-engine.js — the shared scorer behind Framework Audit and (new) the
// Continuity Audit. One engine, extendable with an extra domain-specific
// dimension, instead of forking Framework Audit a second time.
//
// Zero dependencies. Pure functions, no DOM. Same portability pattern as lexicon-engine.js:
// wrapped in an IIFE so a classic <script src="coherence-score-engine.js"> leaks nothing
// but `window.CoherenceScoreEngine`, and works identically via require() in Node.
//
// Default scoring (no config) retains Framework Audit's word lists and five weighted
// dimensions (action .30, testable .30, plain .18, goal .12, backup .10). Advice is
// separately calibrated: absolute-word hits require scope review, not automatic
// weakening of a checkable requirement. A consumer extends it
// by passing `extraDims` — additional {k,label,help,weight,score(ctx)} entries merged into
// the rollup, with the final average always weight-normalized so any dimension set
// (default or extended) produces a sensible 0-100 score.
//
//   CoherenceScoreEngine.makeScorer(config?) -> { DIMS, scorePart(text, goalTokens, allParts, idx), rollup(parts) }
//   config.extraDims: [{ k, label, help, weight, score(ctx) -> 0..100 }]
//     ctx passed to score(ctx): { text, tk, ct, buzz, abs, hasVerb, actor, passive, fail,
//                                 ground, testable, ov, dup, goalTokens, allParts, idx }
//   config.extraVerbs / extraGroundW / extraBuzz / extraAbs / extraActors / extraFailW:
//     arrays unioned into the built-in word lists (e.g. domain-ops verbs like "notarize",
//     "escrow", "reconcile" alongside the generic action verbs).

(function (root, factory) {
  const mod = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = mod;
  else root.CoherenceScoreEngine = mod;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const STOP = new Set("the a an of to in on for from with by and or but is are was were be been being it its this that these those we our us you your they their he she his her as at into over under not no will shall can may must should would could each any all both per via".split(" "));
  const BUZZ = ["holistic","synergy","synergies","synergistic","leverage","leveraging","leverages","robust","seamless","seamlessly","world-class","best-in-class","cutting-edge","empower","empowers","empowering","optimize","optimized","optimizing","streamline","streamlined","scalable","innovative","innovation","next-gen","next-generation","paradigm","ecosystem","value-add","mission-critical","state-of-the-art","turnkey","frictionless","disrupt","disruptive","game-changing","best-of-breed","thought-leadership","value-driven","forward-thinking","cutting","bleeding-edge","supercharge","transformative","revolutionary","unparalleled","industry-leading","first-class","culture","posture","journey","north-star"];
  const ABS = ["always","never","all","none","every","everything","everyone","guarantee","guaranteed","fully","completely","100%","zero","totally","ensure","ensures","ensuring","any","instantly","immediately"];
  const ACTORS = ["we","i","they","team","system","user","users","owner","manager","lead","engineer","operator","admin","org","organization","agent","human","staff","everyone","analyst","reviewer","approver","service","bot","scheduler","monitor"];
  const FAILW = ["if","when","fails","failed","failure","fallback","roll-back","rollback","backup","contingency","recover","recovers","recovery","else","exception","degrade","graceful","retry","retries","mitigate","mitigation","revert","undo","timeout","alert","escalate","escalates","escalation","catch","outage","breach","unless"];
  const GROUNDW = ["per","according","source","sources","study","studies","evidence","measured","measure","metric","metrics","kpi","baseline","data","benchmark","sla","report","reported","standard","iso","nist","owodel","rfc","documented","reference","cite","cited"];
  const VERBS_BASE = "reduce reduces detect detects prevent prevents verify verifies record records route routes allocate allocates measure measures enforce enforces limit limits block blocks check checks monitor monitors log logs encrypt encrypts authenticate authenticates authorize authorizes validate validates test tests review reviews approve approves escalate escalates notify notifies track tracks store stores retrieve retrieves filter filters rank ranks score scores map maps translate translates audit audits flag flags constrain constrains bound bounds cap caps throttle throttles isolate isolates contain contains recover recovers restore restores assign assigns define defines produce produces generate generates convert converts remove removes add adds update updates scan scans analyze analyzes report reports alert alerts trigger triggers handle handles resolve resolves provide provides deliver delivers maintain maintains create creates build builds design designs implement implements run runs execute executes process processes manage manages control controls govern governs mitigate mitigates absorb absorbs reset resets return returns rotate rotates patch patches back-up review schedule schedules deploy deploys collect collects walk weigh write meet call leave drop text serve eat sleep cook clean save pay ship restart get gets join joins keep roll rollback page merge email send".split(" ");

  function toks(s) { return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9%\- ]/g, " ").split(/\s+/).filter(w => w.length > 1); }
  function content(s) { return toks(s).filter(w => !STOP.has(w)); }
  function countIn(tk, list) { let n = 0; tk.forEach(w => { if (list.indexOf(w) >= 0) n++; }); return n; }
  function hasNum(s) { return /\b\d/.test(s) || /%/.test(s); }
  function clamp(x) { return Math.max(0, Math.min(100, Math.round(x))); }

  const BASE_DIMS = [
    { k: "action", label: "Clear actions", help: "says what to actually do" },
    { k: "testable", label: "Testable", help: "you can tell if it worked" },
    { k: "plain", label: "Plain language", help: "no hype or absolutes" },
    { k: "goal", label: "On the goal", help: "each part serves the goal" },
    { k: "backup", label: "Backup plans", help: "says what to do if it fails" },
  ];
  const BASE_WEIGHTS = { action: 0.30, testable: 0.30, plain: 0.18, goal: 0.12, backup: 0.10 };

  function makeScorer(config) {
    config = config || {};
    const VERBS = new Set(VERBS_BASE.concat(config.extraVerbs || []));
    const buzzList = BUZZ.concat(config.extraBuzz || []);
    const absList = ABS.concat(config.extraAbs || []);
    const actorList = ACTORS.concat(config.extraActors || []);
    const failList = FAILW.concat(config.extraFailW || []);
    const groundList = GROUNDW.concat(config.extraGroundW || []);
    const extraDims = config.extraDims || [];
    const DIMS = BASE_DIMS.concat(extraDims.map(d => ({ k: d.k, label: d.label, help: d.help })));
    const weights = Object.assign({}, BASE_WEIGHTS, config.weights || {});
    extraDims.forEach(d => { if (!(d.k in weights)) weights[d.k] = d.weight != null ? d.weight : 0; });
    const weightSum = Object.keys(weights).reduce((s, k) => s + (weights[k] || 0), 0) || 1;

    function scorePart(text, goalTokens, allParts, idx) {
      text = String(text == null ? "" : text); goalTokens = goalTokens || []; allParts = allParts || [];
      const tk = toks(text), ct = content(text);
      const buzz = countIn(tk, buzzList), abs = countIn(tk, absList);
      const hasVerb = tk.some(w => VERBS.has(w));
      const verbish = tk.some(w => /(?:es|ed|ing|ate|ify|ize|ise)$/.test(w) && w.length > 4);
      const actor = tk.some(w => actorList.indexOf(w) >= 0);
      const passive = /\b(is|are|was|were|be|been|being)\b/.test(text.toLowerCase()) && !actor;
      const fail = countIn(tk, failList) > 0;
      let ground = hasNum(text) ? 1 : 0; ground += countIn(tk, groundList) > 0 ? 1 : 0;
      const testable = hasNum(text) || /\bif\b.*\b(then|fail|fails|roll ?back|fall ?back|revert|page|alert|escalate|retry|else)\b/.test(text.toLowerCase()) || /\b(within|under|over|less than|more than|at least|no more than|daily|weekly|monthly|per day|per week|times a week|days a week|minutes|hours)\b/.test(text.toLowerCase()) || /\bevery\s+(day|week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|morning|evening|night|hour|quarter|shift|sprint)\b/.test(text.toLowerCase());
      let ov = 0; ct.forEach(w => { if (goalTokens.indexOf(w) >= 0) ov++; });
      let dup = false, mine = content(text).sort().join(" ");
      for (let j = 0; j < allParts.length; j++) { if (j !== idx) { const other = content(allParts[j]).sort().join(" "); if (other.length > 0 && other === mine) { dup = true; break; } } }
      const imper = tk.length > 0 && VERBS.has(tk[0]);

      const s = {};
      s["action"] = clamp(((hasVerb || imper) ? 100 : verbish ? 60 : 28) - buzz * 20 - abs * 8);
      s["testable"] = testable ? 100 : (ground ? 70 : 40);
      s["plain"] = clamp(100 - buzz * 26 - abs * 14);
      s["goal"] = goalTokens.length === 0 ? 70 : (ov >= 2 ? 100 : ov === 1 ? 80 : 55);
      s["backup"] = fail ? 100 : 60;
      s["agency"] = (actor || imper) ? 100 : passive ? 45 : 62;
      s["coherence"] = dup ? 35 : 90;

      const flags = [], fix = [];
      if (s["action"] < 50) { flags.push(["bad", "no clear action"]); fix.push("Start with a verb: what does this actually DO? (walk, weigh, call, check, send...)"); }
      if (buzz > 0) { flags.push(["bad", buzz + " hype word" + (buzz > 1 ? "s" : "")]); fix.push("Cut the hype word and say it plainly. If nothing is left, it was filler."); }
      if (abs > 0) { flags.push(["mid", "absolute wording"]); fix.push("Check the scope of the absolute wording. Keep explicit, testable requirements, such as blocking a merge if a test fails. Qualify promises you cannot check."); }
      if (s["testable"] < 60) { flags.push(["mid", "no measure"]); fix.push("Add a number or a cadence so you can tell if it worked: 30 minutes, 5 days a week, every Monday."); }
      if (s["goal"] < 60 && goalTokens.length) { flags.push(["mid", "loosely tied to goal"]); fix.push("Say in plain words how this serves the goal, or drop it."); }
      if (s["coherence"] < 50) { flags.push(["bad", "repeats another part"]); fix.push("This duplicates another line. Merge them."); }

      const ctx = { text, tk, ct, buzz, abs, hasVerb, actor, passive, fail, ground, testable, ov, dup, goalTokens, allParts, idx };
      extraDims.forEach(d => {
        const v = clamp(d.score(ctx));
        s[d.k] = v;
        if (d.flagIf && d.flagIf(v, ctx)) { flags.push([d.flagSev || "mid", d.flagLabel || (d.label + " needs work")]); if (d.fixText) fix.push(d.fixText(ctx)); }
      });

      if (!flags.length) flags.push(["ok", "clear and testable"]);
      let wsum = 0, wtot = 0;
      Object.keys(weights).forEach(k => { if (k in s) { wsum += weights[k] * s[k]; wtot += weights[k]; } });
      const avg = Math.round(wsum / (wtot || 1));
      return { scores: s, flags, fix, avg, text };
    }

    function rollup(parts) {
      const dimAvg = {};
      DIMS.forEach(d => { let sum = 0; parts.forEach(p => { sum += p.scores[d.k]; }); dimAvg[d.k] = Math.round(sum / (parts.length || 1)); });
      const overall = Math.round(parts.reduce((a, p) => a + p.avg, 0) / (parts.length || 1));
      const clearN = parts.filter(p => p.avg >= 55).length;
      return { dimAvg, overall, clearN, vagueN: parts.length - clearN };
    }

    return { DIMS, weights, scorePart, rollup };
  }

  return { makeScorer, toks, content, countIn, hasNum, clamp };
});
