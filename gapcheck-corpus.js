/**
 * gapcheck-corpus.js — deterministic pinning harness for Gap Check.
 *
 * Run:  node gapcheck-corpus.js       (from this folder; needs only Node, no deps)
 *
 * Like tracer-corpus.js, it loads analyze() straight out of Delta-Atlas-GapCheck.html
 * (single source of truth — no copy to drift) and runs it against a labeled corpus.
 * THE LABELS ARE THE FLOOR: when a case fails, the fix is to change the rules/lexicon in
 * the HTML, never the label.
 *
 * What this pins: the negation guard. A control named only to say it is ABSENT
 * ("without any guardrail", "no human in the loop") must NOT be credited as present.
 * Before the guard, Gap Check substring-matched the control word and silently marked the
 * risk defended / the autonomy overseen — inflating the safety picture of an unsafe doc.
 * Cancellation fixtures also cover everyday-language bridges in the real page KB:
 * a scrapped control stays absent, a later valid mention still counts, and a
 * cancellation word near a named risk must not erase the risk.
 *
 * License: CC BY 4.0, consistent with the rest of the project.
 */
const fs = require("fs");
const path = require("path");
const assert = require("assert").strict;
const vm = require("vm");
const H = require("./corpus-harness.js");

function loadAnalyze() {
  const html = fs.readFileSync(path.join(__dirname, "Delta-Atlas-GapCheck.html"), "utf8");
  // Robust extraction (matches by content, not tag position): find the inline block that
  // defines analyze(), so adding an attribute to the tag or another script can't break it.
  const scripts = [...html.matchAll(/<script(?: src="[^"]+")?>([\s\S]*?)<\/script>/g)];
  const inline = scripts.map(m => m[1]).find(s => /function analyze\(/.test(s));
  if (!inline) throw new Error("gapcheck-corpus: could not find the inline analyze() block in the HTML");
  const cut = inline.indexOf("function render(");
  if (cut < 0) throw new Error("gapcheck-corpus: 'function render(' marker moved; update the loader");
  const pure = inline.slice(0, cut); // definitions only; no DOM wiring
  const document = { getElementById: () => ({}), addEventListener: () => {} }; // unused stubs
  const LexiconEngine = require("./lexicon-engine.js"); // same shared engine the page loads via <script src>
  const sandbox = {};
  new Function("document", "window", "LexiconEngine", pure + "\nthis.analyze = analyze;").call(sandbox, document, {}, LexiconEngine);
  return sandbox.analyze;
}

// Exercise the real rendering/wiring with a minimal DOM boundary. This checks output
// claims and focus requests, not browser layout or screen-reader behavior.
function loadPage() {
  const html = fs.readFileSync(path.join(__dirname, "Delta-Atlas-GapCheck.html"), "utf8");
  const inline = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map(m => m[1]).find(s => /function analyze\(/.test(s));
  if (!inline) throw new Error("gapcheck-corpus: inline page script missing");
  const elements = {};
  let focused = null;
  function element(id) {
    if (!elements[id]) elements[id] = {
      value: "", innerHTML: "", textContent: "", attributes: {},
      classList: { toggle() {}, add() {} },
      addEventListener() {},
      focus() { focused = id; },
      setAttribute(key, value) { this.attributes[key] = value; },
      querySelectorAll(selector) {
        return selector === '[data-example]' && this.innerHTML.includes('data-example')
          ? [element('result-example')] : [];
      }
    };
    return elements[id];
  }
  const context = {
    document: { getElementById: element, body: element('body') },
    window: {}, location: { hash: '' },
    localStorage: { getItem() { return null; }, removeItem() {} },
    LexiconEngine: require("./lexicon-engine.js")
  };
  vm.runInNewContext(inline + '\nthis.page = { analyze, render, batchRender, runCheck, EXAMPLE };', context);
  return { ...context.page, html, elements, focused: () => focused };
}

function checkPage(name, test) {
  try { test(loadPage()); H.pass(name); }
  catch (error) { H.fail(name, error.message); }
}

function runPresentationCases() {
  checkPage('no-findings result does not invent oversight for a capability mention', page => {
    const result = page.analyze('Machine learning.');
    assert.equal(result.risks.length, 0);
    assert.equal(result.findings.length, 0);
    page.render('Machine learning.');
    const output = page.elements.out.innerHTML;
    assert.match(output, /No matching gaps were flagged/);
    assert.match(output, /does not show that oversight or safeguards are in place/);
    assert.doesNotMatch(output, /oversight is present|Every risk you named has a matching control/);
    assert.equal(page.focused(), null, 'automatic/prefill renders must not steal focus');
  });
  checkPage('matching safeguard terms are not presented as implemented defenses', page => {
    const text = 'Prompt injection. Guardrail.';
    assert.equal(page.analyze(text).defended, 1);
    page.render(text, true);
    assert.match(page.elements.out.innerHTML, /named risks with related safeguard wording/);
    assert.match(page.elements.out.innerHTML, /not evidence that safeguards are implemented or effective/);
    assert.doesNotMatch(page.elements.out.innerHTML, /risks with a control present|risks defended/);
    assert.equal(page.focused(), 'result-title');
    assert.match(page.elements['result-status'].textContent, /Check complete/);
  });
  checkPage('everyday wording with no recognized terms has an actionable example', page => {
    const text = 'It replies to emails. A person looks at each reply before it goes out.';
    assert.equal(page.analyze(text).M.length, 0);
    page.render(text, true);
    assert.match(page.elements.out.innerHTML, /can miss everyday wording/);
    assert.match(page.elements.out.innerHTML, /No finding does not mean your plan is safe/);
    assert.equal(typeof page.elements['result-example'].onclick, 'function');
    page.elements['result-example'].onclick();
    assert.equal(page.elements.src.value, page.EXAMPLE);
    assert.match(page.elements.out.innerHTML, /Autonomy with no oversight/);
    assert.match(page.elements.out.innerHTML, /Risk named with no control: Prompt Injection/);
  });
  checkPage('beginner example flags missing safeguards and uses native definition buttons', page => {
    page.elements.ex.onclick();
    const titles = page.analyze(page.EXAMPLE).findings.map(f => f.t);
    assert(titles.some(t => /Prompt Injection/.test(t)));
    assert(titles.some(t => /Hallucination/.test(t)));
    assert(titles.some(t => /Autonomy with no oversight/.test(t)));
    assert.match(page.elements.out.innerHTML, /<button type="button" class="chip" aria-expanded="false"/);
    assert.doesNotMatch(page.elements.out.innerHTML, /<span class="chip"/);
    assert.match(page.elements.out.innerHTML, /Adding a safeguard name alone does not fix/);
  });
  checkPage('red flags remain visible even when no glossary term is recognized', page => {
    const text = 'We pursue perfect uptime.';
    assert.equal(page.analyze(text).M.length, 0);
    page.render(text);
    assert.match(page.elements.out.innerHTML, /Red flag: Goal pursued/);
  });
  checkPage('batch view describes wording matches and preserves the safety boundary', page => {
    page.batchRender('Machine learning.\n---\nPrompt injection. Guardrail.', true);
    assert.match(page.elements.out.innerHTML, /named risks with related safeguard wording/);
    assert.match(page.elements.out.innerHTML, /No finding does not mean a plan is safe/);
    assert.doesNotMatch(page.elements.out.innerHTML, /risks defended|oversight is present/);
    assert.equal(page.focused(), 'result-title');
    assert.match(page.elements['result-status'].textContent, /2 plans checked/);
  });
  checkPage('empty run and Clear recover to the labeled input without retaining results', page => {
    assert.match(page.html, /<label[^>]*for="src"/);
    assert.match(page.html, /<textarea[^>]*aria-describedby="src-help"/);
    assert.match(page.html, /id="result-status"[^>]*role="status"/);
    assert.match(page.html, /class="atlas-return-nav"[\s\S]*href="index.html" target="_top"/);
    page.runCheck();
    assert.equal(page.focused(), 'src');
    page.elements.ex.onclick();
    page.elements.clr.onclick();
    assert.equal(page.elements.src.value, '');
    assert.doesNotMatch(page.elements.out.innerHTML, /Autonomy with no oversight/);
    assert.equal(page.focused(), 'src');
    assert.match(page.elements['result-status'].textContent, /cleared/);
  });
}

// Each case lists findings that MUST appear (mustFlag) and MUST NOT appear (mustNot), matched
// against the finding titles by regex. The negated-control cases are the ones the old engine failed.
const CORPUS = [
  {
    name: "negated control — risk named, its controls explicitly absent (must still flag the gap)",
    text:
`Our service is exposed to prompt injection.
We operate without any guardrail and without red teaming.`,
    mustFlag: [/Risk named with no control.*Prompt Injection/i],
    mustNot: []
  },
  {
    name: "present control — same risk, controls genuinely in place (must NOT flag)",
    text:
`Our service is exposed to prompt injection.
We deploy a guardrail and run red teaming against it every release.`,
    mustFlag: [],
    mustNot: [/Risk named with no control.*Prompt Injection/i]
  },
  {
    name: "negated oversight — autonomy with oversight explicitly denied (must flag)",
    text:
`The agent operates with no human in the loop and no audit trail.`,
    mustFlag: [/Autonomy with no oversight/i],
    mustNot: []
  },
  {
    name: "present oversight — autonomy with real oversight (must NOT flag the oversight gap)",
    text:
`The autonomous agent runs with a human in the loop and full transparency, and an audit trail records every action.`,
    mustFlag: [],
    mustNot: [/Autonomy with no oversight/i]
  },
  {
    name: "sanity — plain risk with no control mentioned at all (must flag)",
    text:
`There is a real chance of prompt injection in the pipeline.`,
    mustFlag: [/Risk named with no control.*Prompt Injection/i],
    mustNot: []
  },
  {
    name: "bridge cancellation after control — never-implemented human review is not oversight",
    text: "Our autonomous agent can execute production changes. Human review was never implemented.",
    mustFlag: [/Autonomy with no oversight/i],
    mustNot: []
  },
  {
    name: "bridge cancellation before control — cancelled human review is not oversight",
    text: "Our autonomous agent can execute production changes. We cancelled human review.",
    mustFlag: [/Autonomy with no oversight/i],
    mustNot: []
  },
  {
    name: "bridge negation — absent human review is not oversight",
    text: "Our autonomous agent executes production changes without human review.",
    mustFlag: [/Autonomy with no oversight/i],
    mustNot: []
  },
  {
    name: "bridge present — required human review remains oversight",
    text: "Our autonomous agent can execute production changes. The release requires human review.",
    mustFlag: [],
    mustNot: [/Autonomy with no oversight/i]
  },
  {
    name: "bridge later valid occurrence — a cancelled earlier control does not erase a present one",
    text: "Human review was never implemented. After a separate incident response and a complete process redesign, the autonomous agent now requires human review.",
    mustFlag: [],
    mustNot: [/Autonomy with no oversight/i]
  },
  {
    name: "bridge risk before cancellation — a nearby cancelled control does not erase prompt injection",
    text: "A malicious prompt; cancelled safeguards made it worse.",
    mustFlag: [/Risk named with no control.*Prompt Injection/i],
    mustNot: []
  },
  {
    name: "bridge risk after cancellation — a nearby cancelled control does not erase prompt injection",
    text: "We cancelled safeguards. A malicious prompt reached the service.",
    mustFlag: [/Risk named with no control.*Prompt Injection/i],
    mustNot: []
  }
];

function run() {
  const analyze = loadAnalyze();
  for (const c of CORPUS) {
    const titles = analyze(c.text).findings.map(f => f.t);
    const misses = (c.mustFlag || []).filter(re => !titles.some(t => re.test(t)));
    const wrong = (c.mustNot || []).filter(re => titles.some(t => re.test(t)));
    const ok = misses.length === 0 && wrong.length === 0;
    if (ok) { H.pass(c.name); continue; }
    const detail = [];
    misses.forEach(re => detail.push("expected a finding matching " + re));
    wrong.forEach(re => detail.push("should NOT have flagged " + re));
    detail.push("got: " + (titles.length ? titles.join(" | ") : "(no findings)"));
    H.fail(c.name, detail);
  }
  runPresentationCases();
  process.exit(H.summarize());
}

run();
