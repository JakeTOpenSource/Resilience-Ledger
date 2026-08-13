#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const L = require('../ledger/lib.js');

const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const contract = JSON.parse(fs.readFileSync(
  path.join(root, 'governance', 'contracts', 'atlas-navigation-history.contract.v1.json'), 'utf8'));
const event = JSON.parse(fs.readFileSync(path.join(root, 'governance', 'ledger', 'events', 'governance',
  '000009-atlas-navigation-history-corrected.json'), 'utf8'));
const browserObservation = JSON.parse(fs.readFileSync(path.join(root, 'governance', 'observations',
  '2026-08-13-atlas-navigation-local-browser.json'), 'utf8'));

function extractFunction(text, name) {
  const start = text.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`missing function ${name}`);
  const bodyStart = text.indexOf('{', start);
  let depth = 0;
  for (let index = bodyStart; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    else if (text[index] === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  throw new Error(`unterminated function ${name}`);
}

function failuresFor(text) {
  const failures = [];
  const requireRule = (condition, message) => { if (!condition) failures.push(message); };
  const routeDeclaration = (text.match(/var NAV_ROUTES=Object\.freeze\(\{[\s\S]*?\n \}\);/) || [])[0];
  requireRule(Boolean(routeDeclaration), 'route declaration is missing');
  requireRule(text.includes('target.contentWindow.location.replace(url);'),
    'child navigation must use Location.replace');
  requireRule(text.includes('return Object.prototype.hasOwnProperty.call(NAV_ROUTES,h)?h:null;'),
    'location-derived routes must pass the own-property allowlist');
  requireRule(text.includes("replaceFrameLocation(fr,'Agentic-AI-Governance-Chat.html#embed')") &&
    text.includes("replaceFrameLocation(fr,'about:blank')"),
    'glossary query and clear must replace child history');
  requireRule(text.includes('replaceFrameLocation(f,src)') && text.includes("f.dataset.loaded='true'"),
    'sample must replace its child history exactly once');
  requireRule(!text.includes('frame.src=routePath') && !text.includes("frame.removeAttribute('src')"),
    'main child navigation must not create a second history writer');
  requireRule(text.includes("function applyLocation(){ var route=routeFromLocation(); if(route){nav(route,false);}else{goHome(false);} }"),
    'popstate rendering must suppress parent history writes');

  if (!routeDeclaration || failures.length) return failures;
  const functions = ['base', 'setActive', 'routeFromLocation', 'canReplaceFrameLocation',
    'replaceFrameLocation', 'nav', 'goHome', 'applyLocation'];
  let program;
  try {
    program = [routeDeclaration, ...functions.map((name) => extractFunction(text, name))].join('\n');
    const navSource = extractFunction(text, 'nav');
    const homeSource = extractFunction(text, 'goHome');
    requireRule(navSource.indexOf('canReplaceFrameLocation(frame)') < navSource.indexOf('history.pushState') &&
      navSource.indexOf('history.pushState') < navSource.indexOf('replaceFrameLocation(frame,routePath)'),
    'tool navigation must preflight, write parent history, then replace the child');
    requireRule(homeSource.indexOf('canReplaceFrameLocation(frame)') < homeSource.indexOf('history.pushState') &&
      homeSource.indexOf('history.pushState') < homeSource.indexOf("replaceFrameLocation(frame,'about:blank')"),
    'home navigation must preflight, write parent history, then clear the child');
  } catch (error) {
    failures.push(error.message);
    return failures;
  }

  const replacements = [];
  const pushes = [];
  const rollbacks = [];
  let focusCount = 0;
  let rejectChildReplace = false;
  const frame = {
    style: { display: 'block' },
    title: 'Delta Atlas content',
    onload: null,
    contentWindow: { location: { replace(value) {
      if (rejectChildReplace) throw new Error('synthetic child replacement rejection');
      replacements.push(value);
    } } }
  };
  const home = { style: { display: 'block' }, scrollTop: 12 };
  const loading = { style: { display: 'none' } };
  const hq = { focus() { focusCount += 1; } };
  const location = { hash: '', pathname: '/' };
  const document = {
    title: 'Delta Atlas',
    querySelectorAll() { return []; },
    getElementById(id) { return id === 'hq' ? hq : null; }
  };
  let rejectParentWrite = false;
  const history = {
    pushState(...args) { if (rejectParentWrite) throw new Error('synthetic history rejection'); pushes.push(args); },
    back() { rollbacks.push('back'); }
  };
  const context = { frame, home, loading, location, document, history };
  const presentationState = () => JSON.stringify({
    frameDisplay: frame.style.display,
    frameTitle: frame.title,
    homeDisplay: home.style.display,
    homeScrollTop: home.scrollTop,
    loadingDisplay: loading.style.display,
    documentTitle: document.title,
    focusCount
  });

  try {
    vm.runInNewContext(program, context, { timeout: 1000 });

    context.applyLocation();
    requireRule(JSON.stringify(replacements) === JSON.stringify(['about:blank']) && pushes.length === 0,
      'initial home render must clear child state without writing parent history');

    replacements.length = 0;
    requireRule(context.nav('Delta-Atlas-GapCheck.html') === true &&
      JSON.stringify(replacements) === JSON.stringify(['Delta-Atlas-GapCheck.html']) &&
      pushes.length === 1 && pushes[0][2] === '#Delta-Atlas-GapCheck.html',
    'Gap Check navigation must make one child replacement and one parent history write');

    replacements.length = 0;
    pushes.length = 0;
    requireRule(context.nav('Delta-Atlas-Tracer.html') === true &&
      JSON.stringify(replacements) === JSON.stringify(['Delta-Atlas-Tracer.html']) &&
      pushes.length === 1 && pushes[0][2] === '#Delta-Atlas-Tracer.html',
    'Tracer navigation must make one child replacement and one parent history write');

    replacements.length = 0;
    pushes.length = 0;
    location.hash = '#Delta-Atlas-GapCheck.html';
    context.applyLocation();
    requireRule(JSON.stringify(replacements) === JSON.stringify(['Delta-Atlas-GapCheck.html']) &&
      pushes.length === 0 && frame.title === 'Gap Check' && document.title === 'Gap Check',
    'Back rendering must restore Gap Check without writing parent history');

    replacements.length = 0;
    pushes.length = 0;
    location.hash = '';
    context.applyLocation();
    requireRule(JSON.stringify(replacements) === JSON.stringify(['about:blank']) &&
      pushes.length === 0 && frame.title === 'Delta Atlas content' && document.title === 'Delta Atlas',
    'Back rendering must restore home and clear child state without writing parent history');

    replacements.length = 0;
    pushes.length = 0;
    const beforeUnknown = presentationState();
    requireRule(context.nav('https://invalid.example/tool.html') === false && replacements.length === 0 &&
      pushes.length === 0 && presentationState() === beforeUnknown,
    'unknown route must be a no-op');

    rejectParentWrite = true;
    const beforeRejectedNav = presentationState();
    requireRule(context.nav('Delta-Atlas-Tracer.html') === false && replacements.length === 0 &&
      pushes.length === 0 && presentationState() === beforeRejectedNav,
    'rejected parent history write must leave tool presentation unchanged');
    requireRule(context.goHome(true) === false && replacements.length === 0 &&
      pushes.length === 0 && presentationState() === beforeRejectedNav,
    'rejected parent history write must leave home presentation unchanged');

    rejectParentWrite = false;
    rejectChildReplace = true;
    pushes.length = 0;
    rollbacks.length = 0;
    const beforeRejectedChild = presentationState();
    requireRule(context.nav('Delta-Atlas-Tracer.html') === false && replacements.length === 0 &&
      pushes.length === 1 && rollbacks.length === 1 &&
      presentationState() === beforeRejectedChild,
    'post-push child failure must leave presentation unchanged and request one parent rollback');
    pushes.length = 0;
    rollbacks.length = 0;
    requireRule(context.goHome(true) === false && replacements.length === 0 &&
      pushes.length === 1 && rollbacks.length === 1 &&
      presentationState() === beforeRejectedChild,
    'post-push home clear failure must leave presentation unchanged and request one parent rollback');
    rejectChildReplace = false;
  } catch (error) {
    failures.push(`navigation replay failed: ${error.message}`);
  }

  try {
    const secondaryProgram = [extractFunction(text, 'canReplaceFrameLocation'),
      extractFunction(text, 'replaceFrameLocation'), extractFunction(text, 'heroSearch'),
      extractFunction(text, 'clearResults')].join('\n');
    const queryReplacements = [];
    const messages = [];
    let queryFocus = 0;
    let resultScrolls = 0;
    const query = { value: 'what is a harness?', focus() { queryFocus += 1; } };
    const result = { style: { display: 'none' }, scrollIntoView() { resultScrolls += 1; } };
    const answerFrame = {
      onload: null,
      contentWindow: {
        location: { replace(value) { queryReplacements.push(value); } },
        postMessage(message, target) { messages.push({ message, target }); }
      }
    };
    const queryDocument = {
      getElementById(id) {
        return { hq: query, ansframe: answerFrame, results: result }[id] || null;
      }
    };
    const queryContext = { document: queryDocument, location: { origin: 'https://preview.invalid' } };
    vm.runInNewContext(secondaryProgram, queryContext, { timeout: 1000 });
    queryContext.heroSearch();
    if (typeof answerFrame.onload === 'function') answerFrame.onload();
    requireRule(JSON.stringify(queryReplacements) === JSON.stringify(['Agentic-AI-Governance-Chat.html#embed']) &&
      result.style.display === 'block' && resultScrolls === 1 && messages.length === 1 &&
      messages[0].message.type === 'delta-atlas-query' && messages[0].message.query === 'what is a harness?' &&
      messages[0].target === 'https://preview.invalid',
    'glossary query must replace child history and send only the in-memory typed message');
    queryContext.clearResults();
    requireRule(JSON.stringify(queryReplacements) ===
      JSON.stringify(['Agentic-AI-Governance-Chat.html#embed', 'about:blank']) &&
      result.style.display === 'none' && query.value === '' && queryFocus === 1,
    'glossary clear must replace the child with about:blank before clearing presentation');

    const sampleScript = [...text.matchAll(/<script>([\s\S]*?)<\/script>/g)]
      .map((match) => match[1]).find((script) => script.includes('illustrative sample'));
    requireRule(Boolean(sampleScript), 'sample navigation script is missing');
    if (sampleScript) {
      const sampleReplacements = [];
      const listeners = {};
      const sample = { open: false, addEventListener(type, listener) { listeners[type] = listener; } };
      const sampleFrame = {
        dataset: {},
        getAttribute(name) { return name === 'data-src' ? 'Delta-Atlas-GapCheck.html#embed' : null; },
        contentWindow: { location: { replace(value) { sampleReplacements.push(value); } } }
      };
      const sampleDocument = { querySelector(selector) { return selector === '.sample' ? sample : sampleFrame; } };
      vm.runInNewContext([extractFunction(text, 'canReplaceFrameLocation'),
        extractFunction(text, 'replaceFrameLocation'), sampleScript].join('\n'), { document: sampleDocument }, { timeout: 1000 });
      sample.open = true;
      listeners.toggle();
      listeners.toggle();
      requireRule(JSON.stringify(sampleReplacements) === JSON.stringify(['Delta-Atlas-GapCheck.html#embed']) &&
        sampleFrame.dataset.loaded === 'true', 'sample must replace child history once on first opt-in');
    }
  } catch (error) {
    failures.push(`secondary-frame replay failed: ${error.message}`);
  }
  return failures;
}

const errors = [];
if (contract.schema_version !== 'atlas-navigation-history-contract.v1' ||
    contract.status !== 'PROPOSED_CORRECTION' ||
    !contract.claim_ceiling.includes('OWNER_MERGE_REQUIRED')) {
  errors.push('navigation contract boundary is invalid');
}
if (event.event_id !== 'evt_governance_atlas_navigation_history_corrected_0009' ||
    event.decision !== 'CORRECT' || event.payload.cloudflare_preview_correction_observation !== 'NOT_YET_OBSERVED' ||
    event.payload.production_deployment !== 'NOT_ATTEMPTED' || event.payload.owner_merge_required !== true) {
  errors.push('navigation correction event boundary is invalid');
}
if (browserObservation.schema_version !== 'atlas-browser-observation.v1' ||
    browserObservation.subject.source_sha256 !== L.sha256CanonicalTextBytes(fs.readFileSync(path.join(root, 'index.html'))) ||
    browserObservation.subject.source_state !== 'UNCOMMITTED_WORKTREE_CANDIDATE' ||
    browserObservation.instrument.profile_or_session_data_collected !== false ||
    browserObservation.result !== 'MATCHED' || browserObservation.cases.some((item) => item.result !== 'MATCHED') ||
    !browserObservation.claim_ceiling.includes('NOT_CLOUDFLARE_PREVIEW')) {
  errors.push('local browser observation boundary or source binding is invalid');
}
for (const reference of event.evidence_refs) {
  if (reference.sha256 === null) continue;
  const locator = reference.source_locator;
  if (typeof locator !== 'string' || path.isAbsolute(locator) || locator.split(/[\\/]/).includes('..')) {
    errors.push(`${reference.ref_id}: unsafe local evidence locator`);
    continue;
  }
  const absolute = path.resolve(root, locator);
  if (!absolute.startsWith(`${root}${path.sep}`) || !fs.existsSync(absolute) ||
      L.sha256CanonicalTextBytes(fs.readFileSync(absolute)) !== reference.sha256) {
    errors.push(`${reference.ref_id}: evidence digest mismatch`);
  }
}
errors.push(...failuresFor(source));

const canaries = [
  source.replace('target.contentWindow.location.replace(url);', 'target.src=url;'),
  source.replace('if(writeHistory!==false){try{ history.pushState({route:routePath}',
    'if(true){try{ history.pushState({route:routePath}'),
  source.replace("replaceFrameLocation(frame,'about:blank')", "replaceFrameLocation(frame,'Delta-Atlas-GapCheck.html')"),
  source.replace("return Object.prototype.hasOwnProperty.call(NAV_ROUTES,h)?h:null;",
    'return h||null;'),
  source.replace("}catch(e){return false;}}\n   frame.onload", "}catch(e){}}\n   frame.onload"),
  source.replace("if(!replaceFrameLocation(fr,'Agentic-AI-Governance-Chat.html#embed')){fr.onload=null; return;}",
    "fr.src='Agentic-AI-Governance-Chat.html#embed';"),
  source.replace("if(!replaceFrameLocation(fr,'about:blank')) return false;",
    "fr.removeAttribute('src');"),
  source.replace("src&&replaceFrameLocation(f,src)", "src&&f.setAttribute('src',src)"),
  source.replace("if(writeHistory!==false){try{history.back();}catch(e){}} return false;", 'return false;'),
  source.replaceAll("if(writeHistory!==false){try{history.back();}catch(e){}} return false;", 'return false;')
];
for (const [index, mutated] of canaries.entries()) {
  if (failuresFor(mutated).length === 0) errors.push(`navigation mutation ${index + 1} was not rejected`);
}

if (errors.length) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exit(1);
}
console.log(`Home navigation history verification PASS (${canaries.length} mutation canaries)`);
