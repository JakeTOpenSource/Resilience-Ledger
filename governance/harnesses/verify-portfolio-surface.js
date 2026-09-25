#!/usr/bin/env node
'use strict';

/* Deterministic, no-network checks for the research portfolio added on 2026-09-25:
   the eight paper pages, the Library "Protocols and papers" and "Figures" sections,
   and the home-page link strip. Status words are load-bearing: each page, card, and
   strip line must keep the document's own status and claim boundary, and none may
   be upgraded. Mutation canaries at the end prove each guard bites. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const PAPERS = [
  { page: 'Paper-STP-v1-2.html', file: 'assets/papers/stp-v1.2-candidate.docx',
    chip: 'PROPOSED · owner review required', card: [/PROPOSED/, /owner review/, /formal baseline/],
    must: [/PROPOSED; owner review required/, /STP v1\.1 remains current; no silent supersession/, /acceptance gates in section 16/,
      /append-only owner receipt/, /STP v1\.1 remains the formal baseline/, /termination is UNKNOWN and Ledger identity is BLOCKING/,
      /synthetic fixtures/, /not the complete draft/],
    mustNot: [/\bv1\.2\b[^.<]{0,60}\b(?:is|was|has been) (?:formally )?accepted\b/i, /\bsupersedes STP v1\.1\b/i, /formal protocol/i] },
  { page: 'Paper-STP-v1-1.html', file: 'assets/papers/stp-v1.1.pdf',
    chip: 'Open source independent research · CC BY 4.0', card: [/formal baseline/],
    must: [/Open source independent research/, /candidate synthesis/,
      /STP v1\.1 remains the current baseline until an owner receipt records a decision on v1\.2/, /does not establish external truth/],
    mustNot: [/\bsuperseded\b/i] },
  { page: 'Paper-Thetabase.html', file: 'assets/papers/thetabase.pdf',
    chip: 'Design brief · local runs, not production', card: [/design brief/i, /not production/i],
    must: [/not production traffic/, /not published here/, /whole-job caching was faster/, /No universal crossover threshold is claimed/,
      /do not establish novelty or production validation/],
    mustNot: [/cache aggressively/i] },
  { page: 'Paper-Calibration-Ledger-v9.html', file: 'assets/papers/calibration-ledger-v9.pdf',
    chip: 'Research ledger · pre-publication · not peer reviewed', card: [/IMPLEMENTED, TESTED, PROPOSED, or UNKNOWN/],
    must: [/RESEARCH LEDGER \| PRE-PUBLICATION \| NOT PEER REVIEWED/, /L3 to L5 are UNKNOWN/, /IMPLEMENTED, TESTED, PROPOSED, or UNKNOWN/,
      /does not establish product efficacy, production safety/],
    mustNot: [/lab notebook/i] },
  { page: 'Paper-Which-Labels.html', file: 'assets/papers/which-labels-an-ai-actually-uses.pdf',
    chip: 'Small measured experiment · one model family', card: [/first run/],
    must: [/one model family/, /in the first run it was never used/, /rose from one case to two/, /cause is not isolated/,
      /does not show that other models or model families behave the same way/, /not yet on the main branch/],
    mustNot: [/\bmodels pick\b/i, /universal/i, /never used across/i] },
  { page: 'Paper-AI-Assisted-Work.html', file: 'assets/papers/ai-work-accepted-state.pdf',
    chip: 'Evidence review · 5 September 2026', card: [/evidence review/i, /Negative results are retained/],
    must: [/REPRODUCED/, /SOURCE CHECKED/, /remain unestablished/, /not independent replication/, /prepared with OpenAI Codex/],
    mustNot: [/has proved/i] },
  { page: 'Paper-From-Model-Output.html', file: 'assets/papers/from-model-output-to-accepted-state.pdf',
    chip: 'Working paper · owner-review draft v4', card: [/owner-review draft v4/],
    must: [/owner-review draft v4/, /no completed publication commitment/, /\bTESTED\b[\s\S]*\bOBSERVED\b[\s\S]*\bPROPOSED\b[\s\S]*\bOPEN\b/,
      /not independent reproduction/, /diagnostic inventory, not a coverage measure/, /Intended for release under CC BY 4\.0/,
      /used on one public software project/, /later 37-page build/],
    mustNot: [/citable/i, /tagged PROPOSED or TESTED/i] },
  { page: 'Paper-State-Delta-Architecture-v3.html', file: 'assets/papers/state-delta-architecture-3.0.pdf',
    chip: 'Blueprint · not a tested implementation', card: [/blueprint/i],
    must: [/not finished work/, /design intentions, not demonstrated outcomes/, /No date printed/],
    mustNot: [/(?<!not a )\btested implementation\b/i] },
];

const CARDS = [
  ['State Transition Protocol v1.2 Candidate', 'Paper-STP-v1-2.html'], ['State Transition Protocol v1.1', 'Paper-STP-v1-1.html'],
  ['Thetabase', 'Paper-Thetabase.html'], ['Calibration Ledger v9', 'Paper-Calibration-Ledger-v9.html'],
  ['Which labels an AI actually uses on its own work', 'Paper-Which-Labels.html'], ['AI Assisted Work and Accepted State', 'Paper-AI-Assisted-Work.html'],
  ['From Model Output to Accepted State', 'Paper-From-Model-Output.html'], ['State-Delta Architecture 3.0', 'Paper-State-Delta-Architecture-v3.html'],
];

const FIGURES = ['stp-fig1-consequence-path', 'stp-fig2-state-layers', 'stp-fig3-causal-merge-conflict', 'stp-fig4-hysteresis',
  'stp-fig5-zero-trust', 'vir-crosswalk-final', 'bespokenode-diagram', 'thetabase-p1', 'thetabase-p2', 'thetabase-p3', 'thetabase-p4', 'thetabase-p5'];

const STRIP = [
  ['State Transition Protocol v1.2', 'Paper-STP-v1-2.html'], ['Thetabase', 'Paper-Thetabase.html'],
  ['Calibration Ledger v9', 'Paper-Calibration-Ledger-v9.html'], ['Which labels an AI actually uses', 'Paper-Which-Labels.html'],
  ['AI Assisted Work and Accepted State', 'Paper-AI-Assisted-Work.html'], ['From Model Output to Accepted State', 'Paper-From-Model-Output.html'],
  ['State-Delta Architecture 3.0', 'Paper-State-Delta-Architecture-v3.html'], ['Figures', 'Delta-Atlas-Library.html#figures'],
];

const EM_DASH = /—|&mdash;|&#8212;|&#x2014;/i;
const UPGRADE_WORDS = /\bsupersede[sd]?\b|\bformal protocol\b|\bcitable\b|\bproduction[- ]validated\b/i;
const UPGRADE = { test: (t) => /\bACCEPTED\b/.test(t) || UPGRADE_WORDS.test(t) };  // ACCEPTED is a status token; 'Accepted State' in a title is not
const UNPUBLISHED = /\b(?:30%|70%|50%|20%|90%|100\/100|16 vignettes|55 alarms|56 frozen prompts|50 crude-hint|GT-[0-9]+\b|MED v2|Track [CM]\b|zero false alarms|false alarms?|premise and honest|honest runs|substantive disagreements|denaturation|crosstalk|vignettes?|MRI)/i;
const decode = (s) => s.replace(/&middot;/g, '·').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&');
const visible = (source) => decode(source.replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function failuresFor(surfaces) {
  const f = [];
  const need = (condition, message) => { if (!condition) f.push(message); };

  for (const paper of PAPERS) {
    const html = surfaces[paper.page];
    if (html === undefined) { f.push(`${paper.page}: page is missing`); continue; }
    const text = visible(html);
    need(exists(paper.file), `${paper.file}: paper file is missing`);
    need(html.includes(`href="${paper.file}"`), `${paper.page}: does not link its paper file`);
    need((html.match(/<h1\b/g) || []).length === 1 && (html.match(/<main\b/g) || []).length === 1, `${paper.page}: needs one h1 and one main`);
    for (const heading of ['What it means', 'How it functions', 'Status and claim boundary']) {
      need(new RegExp(`<h2[^>]*>${heading}</h2>`).test(html), `${paper.page}: missing section "${heading}"`);
    }
    const chip = decode((html.match(/<p class="status-chip">([^<]*)<\/p>/) || ['', ''])[1]);
    need(chip === paper.chip, `${paper.page}: status chip reads "${chip}"`);
    need(/<nav class="atlas-return-nav"[^>]*><a href="index\.html" target="_top">/.test(html), `${paper.page}: missing the native Home bar`);
    for (const pattern of paper.must) need(pattern.test(text), `${paper.page}: status or boundary text missing: ${pattern}`);
    for (const pattern of paper.mustNot) need(!pattern.test(text), `${paper.page}: upgraded or forbidden wording present: ${pattern}`);
    need(!EM_DASH.test(html), `${paper.page}: contains an em dash`);
    need(!/\bproved\b/i.test(text), `${paper.page}: uses "proved"; the owner's word is "proven"`);
    need(!UNPUBLISHED.test(text), `${paper.page}: carries an unpublished probe identifier or figure`);
    for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) need(/rel="[^"]*noopener/.test(m[0]), `${paper.page}: new-tab link without noopener`);
  }

  const library = surfaces['Delta-Atlas-Library.html'];
  const papersSection = (library.match(/<section id="papers"[\s\S]*?<\/section>/) || [''])[0];
  const figuresSection = (library.match(/<section id="figures"[\s\S]*?<\/section>/) || [''])[0];
  need(/<h2 id="papers-title">Protocols and papers<\/h2>/.test(papersSection), 'Library: "Protocols and papers" section is missing');
  need(/<h2 id="figures-title">Figures<\/h2>/.test(figuresSection), 'Library: "Figures" section is missing');
  const cards = [...papersSection.matchAll(/<article class="card">([\s\S]*?)<\/article>/g)].map((m) => m[1]);
  const cardPairs = cards.map((b) => { const m = b.match(/<h3><a href="([^"]+)" target="_top">([^<]+)<\/a><\/h3>/); return m ? [decode(m[2]), m[1]] : ['', '']; });
  need(JSON.stringify(cardPairs) === JSON.stringify(CARDS), 'Library: paper card titles, order, or targets changed');
  for (const paper of PAPERS) {
    const block = cards.find((b) => b.includes(`href="${paper.page}"`)) || '';
    const cardText = visible(block);
    for (const token of paper.card) need(token.test(cardText), `Library: card for ${paper.page} lost its status wording ${token}`);
    need(!UPGRADE.test(cardText), `Library: card for ${paper.page} upgrades its status`);
  }

  const gallery = [...figuresSection.matchAll(/<li><a class="thumb" href="#fig-([a-z0-9-]+)"[\s\S]*?<\/li>/g)];
  need(gallery.length === FIGURES.length, `Library: gallery has ${gallery.length} figures, expected ${FIGURES.length}`);
  for (const name of FIGURES) {
    need(exists(`assets/figures/${name}.png`), `assets/figures/${name}.png is missing`);
    need(exists(`assets/figures/thumbs/${name}.webp`), `assets/figures/thumbs/${name}.webp is missing`);
    need(figuresSection.includes(`src="assets/figures/thumbs/${name}.webp"`), `Library: gallery thumbnail missing for ${name}`);
    need(figuresSection.includes(`src="assets/figures/${name}.png"`), `Library: enlarged view missing for ${name}`);
  }
  for (const item of gallery) {
    const id = item[1];
    const boxMatch = figuresSection.match(new RegExp(`<div class="lightbox" id="fig-${id}"[\\s\\S]*?<p class="lb-cap">([\\s\\S]*?)</p>`));
    need(Boolean(boxMatch), `Library: thumbnail #fig-${id} has no enlarged view`);
    need(/<img\b[^>]*alt="[^"]{20,}"/.test(item[0]), `Library: figure ${id} lacks a descriptive alt text`);
    const caption = visible((item[0].match(/<p class="cap">([\s\S]*?)<\/p>/) || ['', ''])[1]);
    const boxCaption = boxMatch ? visible(boxMatch[1]) : '';
    need(/\bnot\b/.test(caption), `Library: caption for ${id} does not state what the figure does not prove`);
    need(caption === boxCaption, `Library: enlarged caption for ${id} differs from its gallery caption`);
    need(!/\.\.(?!\.)/.test(caption), `Library: caption for ${id} has a doubled period`);
  }
  need(/not an empirically validated law/.test(figuresSection), 'Library: the V=IR caption lost its claim frame');
  need(!/<(?:script|form|input|textarea|iframe)\b/i.test(library), 'Library: must stay a passive page without script or form controls');
  need(!EM_DASH.test(library), 'Library: contains an em dash');
  need(!/\bproved\b/i.test(visible(library)), 'Library: uses "proved"');

  const home = surfaces['index.html'];
  const strip = (home.match(/<section class="garden-tools corpus"[\s\S]*?<\/section>/) || [''])[0];
  const links = [...strip.matchAll(/<li><a class="dlink" href="([^"]+)" target="_top">([^<]+)<\/a><span>([^<]+)<\/span><\/li>/g)];
  need(JSON.stringify(links.map((m) => [m[2], m[1]])) === JSON.stringify(STRIP), 'Home: link strip names, order, or targets changed');
  for (const m of links) {
    need(exists(m[1].split('#')[0]), `Home: strip target ${m[1]} does not exist`);
    need(!UPGRADE.test(decode(m[3])), `Home: strip line for ${m[2]} upgrades its status`);
  }
  const stripV12 = decode((links.find((m) => m[1] === 'Paper-STP-v1-2.html') || ['', '', '', ''])[3]);
  need(/PROPOSED/.test(stripV12) && /owner review/.test(stripV12), 'Home: the STP v1.2 strip line lost PROPOSED or owner review');
  need(home.indexOf('class="doors primary-tools primary-skills"') < home.indexOf('<section class="garden-tools corpus"') &&
    home.indexOf('<section class="garden-tools corpus"') < home.indexOf('<div class="block evidence-entry receipts-entry">'),
    'Home: the link strip must sit below the three cards and above the receipts strip');
  need(!/\bproved\b/i.test(visible(strip)) && !EM_DASH.test(strip), 'Home: link strip uses "proved" or an em dash');
  return f;
}

const surfaces = { 'Delta-Atlas-Library.html': read('Delta-Atlas-Library.html'), 'index.html': read('index.html') };
for (const paper of PAPERS) if (exists(paper.page)) surfaces[paper.page] = read(paper.page);

const failures = failuresFor(surfaces);

/* Mutation canaries: each edit must make the check fail, or the check is not guarding anything. */
const canaries = [
  ['Paper-STP-v1-2.html', (s) => s.replaceAll('PROPOSED; owner review required', 'ACCEPTED')],
  ['Paper-STP-v1-2.html', (s) => s.replace('</main>', '<p>STP v1.2 is formally accepted.</p></main>')],
  ['Paper-STP-v1-2.html', (s) => s.replace('<h2 id="status-title">Status and claim boundary</h2>', '<h2 id="status-title">Notes</h2>')],
  ['Paper-STP-v1-1.html', (s) => s.replace('</main>', '<p>This version is superseded.</p></main>')],
  ['Paper-Thetabase.html', (s) => s.replaceAll('not production traffic', 'production traffic')],
  ['Paper-Thetabase.html', (s) => s.replace('Design brief · local runs, not production', 'Production library')],
  ['Paper-Calibration-Ledger-v9.html', (s) => s.replaceAll('NOT PEER REVIEWED', 'PEER REVIEWED')],
  ['Paper-Which-Labels.html', (s) => s.replace('</main>', '<p>Models pick the easiest label.</p></main>')],
  ['Paper-Which-Labels.html', (s) => s.replace('</main>', '<p>GT-8 results.</p></main>')],
  ['Paper-AI-Assisted-Work.html', (s) => s.replace('</main>', '<p>What the program has proved.</p></main>')],
  ['Paper-From-Model-Output.html', (s) => s.replaceAll('owner-review draft v4', 'final paper')],
  ['Paper-State-Delta-Architecture-v3.html', (s) => s.replace('</main>', '<p>A result — shown.</p></main>')],
  ['Delta-Atlas-Library.html', (s) => s.replaceAll('not an empirically validated law', 'a validated law')],
  ['Delta-Atlas-Library.html', (s) => s.replace('<div class="lightbox" id="fig-vir"', '<div class="lightbox" id="fig-gone"')],
  ['Delta-Atlas-Library.html', (s) => s.replace('</main>', '<script src="x.js"></script></main>')],
  ['Delta-Atlas-Library.html', (s) => s.replace('The working version of the protocol, PROPOSED and under owner review.', 'The formal protocol, now ACCEPTED.')],
  ['Delta-Atlas-Library.html', (s) => s.replace('href="Paper-Thetabase.html" target="_top">Thetabase', 'href="Paper-Calibration-Ledger-v9.html" target="_top">Thetabase')],
  ['Delta-Atlas-Library.html', (s) => s.replace('<p class="lb-cap"><b>V=IR', '<p class="lb-cap"><b>Changed V=IR')],
  ['index.html', (s) => s.replace('href="Paper-Thetabase.html" target="_top">Thetabase', 'href="Paper-Missing.html" target="_top">Thetabase')],
  ['index.html', (s) => s.replace('The working version of the protocol, PROPOSED and under owner review.', 'The formal protocol, ACCEPTED; it supersedes v1.1.')],
];
for (const [index, [file, mutate]] of canaries.entries()) {
  const mutated = Object.assign({}, surfaces, { [file]: mutate(surfaces[file] || '') });
  if (mutated[file] === surfaces[file]) failures.push(`mutation canary ${index + 1} did not alter ${file}`);
  else if (failuresFor(mutated).length === 0) failures.push(`mutation canary ${index + 1} on ${file} was not rejected`);
}

if (failures.length) {
  for (const message of failures) console.error(`FAIL ${message}`);
  process.exitCode = 1;
} else {
  console.log(`Portfolio surface verification PASS (${PAPERS.length} paper pages, ${FIGURES.length} figures, ${STRIP.length} strip links, ${canaries.length} mutation canaries)`);
}
