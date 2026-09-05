#!/usr/bin/env node
'use strict';

// Offline regression checks for native recovery navigation and the real text reader.
// DOM/fetch mocks test observable decisions, not browser layout or accessibility conformance.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const { TextDecoder } = require('util');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let passed = 0, failed = 0;
async function check(name, fn) {
  try { await fn(); passed++; console.log('PASS ' + name); }
  catch (error) { failed++; console.error('FAIL ' + name + ': ' + error.message); }
}
function decode(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
    const key = entity.slice(1, -1).toLowerCase();
    if (key.startsWith('#x')) return String.fromCodePoint(parseInt(key.slice(2), 16));
    if (key.startsWith('#')) return String.fromCodePoint(parseInt(key.slice(1), 10));
    return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[key];
  });
}
function attrs(tag) {
  const result = {};
  const body = tag.replace(/^<\/?[\w:-]+/, '').replace(/\/?\s*>$/, '');
  for (const match of body.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}
function markup(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '');
}
function anchors(html) {
  return [...markup(html).matchAll(/<a\b[^>]*>[\s\S]*?<\/a\s*>/gi)].map(match => ({
    attributes: attrs(match[0].slice(0, match[0].indexOf('>') + 1)),
    text: decode(match[0].replace(/<[^>]*>/g, '')).trim(),
  }));
}
function homeAnchor(html) {
  return anchors(html).find(a => /^\/?index\.html$/.test(a.attributes.href || '') &&
    a.attributes.target === '_top' && /home|atlas|start/i.test(a.text) &&
    !Object.hasOwn(a.attributes, 'hidden') && !Object.hasOwn(a.attributes, 'onclick'));
}
function extractFunction(source, name) {
  const start = source.indexOf('function ' + name + '(');
  assert(start >= 0, 'missing function ' + name);
  const firstBrace = source.indexOf('{', start);
  let depth = 0, quote = '', comment = '';
  for (let i = firstBrace; i < source.length; i++) {
    const c = source[i], next = source[i + 1];
    if (comment === 'line') { if (c === '\n') comment = ''; continue; }
    if (comment === 'block') { if (c === '*' && next === '/') { comment = ''; i++; } continue; }
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
    if (c === '/' && next === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && next === '*') { comment = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('unterminated function ' + name);
}
function invokeBrand(source, outcome, overrides = {}) {
  const calls = [], cancellations = [];
  const context = { goHome(value) {
    calls.push(value);
    if (outcome === 'throw') throw new Error('synthetic navigation failure');
    return outcome;
  } };
  vm.runInNewContext(extractFunction(source, 'returnToAtlas'), context, { timeout: 1000 });
  const event = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false,
    preventDefault() { cancellations.push(true); }, ...overrides };
  context.returnToAtlas(event);
  return { calls, cancellations };
}
function runReturnScript(source, mode) {
  const nav = { hidden: false, getBoundingClientRect: () => ({ height: 54 }) };
  const documentElement = { dataset: {}, style: { setProperty() {} } };
  const document = { documentElement, querySelector: selector => selector === 'nav.atlas-return-nav' ? nav : null };
  const window = { addEventListener() {} };
  if (mode === 'top') window.parent = window;
  else if (mode === 'cross-origin') {
    window.parent = Object.defineProperty({}, 'document', { get() { throw new Error('cross-origin document denied'); } });
  } else window.parent = { document: { documentElement: { dataset: mode === 'atlas' ? { atlasShell: 'true' } : {} } } };
  vm.runInNewContext(source, { document, window }, { timeout: 1000 });
  return { hidden: nav.hidden, identified: documentElement.dataset.atlasReturnEmbedded };
}

// Run the actual reader IIFE and captured DOMContentLoaded callback. All responses
// are bounded in-memory fixtures; no network access or production data is needed.
async function runReader(source, html, fixture = {}) {
  let init;
  let innerHTMLWrites = 0;
  const nodes = {};
  for (const match of markup(html).matchAll(/<[a-z][\w:-]*\b[^>]*>/gi)) {
    const attributes = attrs(match[0]);
    if (!attributes.id) continue;
    const element = { attributes, dataset: {}, hidden: Object.hasOwn(attributes, 'hidden'), textContent: '',
      setAttribute(key, value) { this.attributes[key] = String(value); } };
    Object.defineProperty(element, 'innerHTML', { set() { innerHTMLWrites++; throw new Error('reader assigned innerHTML'); } });
    nodes[attributes.id] = element;
  }
  const document = { readyState: 'loading', title: '',
    getElementById: id => nodes[id] || null,
    addEventListener(type, callback) { if (type === 'DOMContentLoaded') init = callback; } };
  const location = new URL('https://atlas.test/Delta-Atlas-Document.html' + (fixture.query ?? '?file=README.md'));
  const calls = [], cancellations = [];
  function response(body, options = {}) {
    const bytes = Buffer.from(body, 'utf8');
    const chunks = options.chunks || [bytes];
    let index = 0;
    return { ok: options.ok !== false, status: options.status || 200,
      headers: { get: name => name === 'content-length' ? (options.length ?? null) : null },
      body: { async cancel() { cancellations.push('body'); }, getReader() { return {
        async read() { return index < chunks.length ? { done: false, value: chunks[index++] } : { done: true }; },
        async cancel() { cancellations.push('reader'); }, releaseLock() {},
      }; } } };
  }
  const fixtureManifest = fixture.manifest ?? { type: 'delta-atlas-public-documents', version: 1, files: ['README.md', 'terms.json'] };
  const fetch = async (url, options) => {
    calls.push({ url, options });
    if (new URL(url).pathname === '/assets/atlas-documents-v1.json') {
      if (fixture.manifestThrows) throw new Error('synthetic manifest fetch failure');
      return response(typeof fixtureManifest === 'string' ? fixtureManifest : JSON.stringify(fixtureManifest));
    }
    if (fixture.fileThrows) throw new Error('synthetic file fetch failure');
    return response(fixture.text ?? '# Atlas\nA readable document.', fixture.fileOptions);
  };
  vm.runInNewContext(source, { document, location, URL, URLSearchParams, TextDecoder, fetch }, { timeout: 1000 });
  assert.equal(typeof init, 'function', 'reader did not register DOMContentLoaded initialization');
  await init();
  return { nodes, calls, cancellations, innerHTMLWrites, home: homeAnchor(html),
    state: nodes['document-status'].dataset.state, text: nodes['document-text'].textContent,
    documentRequests: calls.filter(c => new URL(c.url).pathname !== '/assets/atlas-documents-v1.json') };
}

async function main() {
  const index = read('index.html');
  const helper = read('assets/atlas-return-v1.js');
  const readerHTML = read('Delta-Atlas-Document.html');
  const reader = read('assets/atlas-document-v1.js');
  const manifest = JSON.parse(read('assets/atlas-documents-v1.json'));
  await check('brand is a native top-level Home anchor wired to progressive enhancement', () => {
    const brand = anchors(index).find(a => a.attributes.id === 'brand');
    assert(brand, 'brand anchor missing');
    assert.equal(brand.attributes.href, 'index.html');
    assert.equal(brand.attributes.target, '_top');
    assert(/getElementById\(['"]brand['"]\)\.addEventListener\(['"]click['"],\s*returnToAtlas\)/.test(index));
    assert(/\bdata-atlas-shell="true"/.test(index));
  });
  for (const outcome of [true, false, 'throw']) {
    await check('brand preserves native fallback when goHome returns ' + outcome, () => {
      const result = invokeBrand(index, outcome);
      assert.deepEqual(result.calls, [true]);
      assert.equal(result.cancellations.length, outcome === true ? 1 : 0);
    });
  }
  for (const modifier of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey', 'middle', 'right']) {
    await check('brand leaves ' + modifier + ' click native', () => {
      const change = modifier === 'middle' ? { button: 1 } : modifier === 'right' ? { button: 2 } : { [modifier]: true };
      const result = invokeBrand(index, true, change);
      assert.equal(result.calls.length, 0);
      assert.equal(result.cancellations.length, 0);
    });
  }
  const redirects = new Set(['Agentic-AI-Governance-Map.html', 'Agentic-AI-Governance-Reflections.html']);
  const passivePages = new Set(['Delta-Atlas-Library.html', 'Delta-Atlas-Evidence.html', 'Six-Signal-Method.html']);
  const pages = fs.readdirSync(root).filter(name => name.endsWith('.html')).sort();
  await check('all standalone content pages and 404 retain native Home without JavaScript', () => {
    for (const name of pages.filter(name => name !== 'index.html' && !redirects.has(name))) {
      const html = read(name);
      assert(homeAnchor(html), name + ': missing static top-level Home link');
      if (name !== 'Delta-Atlas-Document.html') {
        assert(/<nav\b[^>]*class="atlas-return-nav"[^>]*>/.test(markup(html)), name + ': shared Home bar missing');
        if (passivePages.has(name)) {
          assert(!/<script\b/i.test(html), name + ': passive page must remain script-free');
          assert(!/<link\b[^>]*rel=["']stylesheet["']/i.test(html), name + ': passive return styling must be inline');
          assert([...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].some(m => /nav\.atlas-return-nav/.test(m[1])),
            name + ': inline return-bar styling missing');
        } else {
          assert(/<script\b[^>]*src="\/?assets\/atlas-return-v1\.js"[^>]*>/.test(html), name + ': return helper missing');
        }
      }
    }
  });
  for (const mode of ['top', 'ordinary-parent', 'cross-origin', 'atlas']) {
    await check('shared Home bar is safe in ' + mode + ' context', () => {
      const result = runReturnScript(helper, mode);
      assert.equal(result.hidden, mode === 'atlas');
      assert.equal(result.identified, mode === 'atlas' ? 'true' : undefined);
    });
  }
  await check('public document manifest has its declared shape and existing safe text files', () => {
    assert.deepEqual(Object.keys(manifest).sort(), ['files', 'type', 'version']);
    assert.equal(manifest.type, 'delta-atlas-public-documents');
    assert.equal(manifest.version, 1);
    assert(Array.isArray(manifest.files) && manifest.files.length > 0);
    for (const file of manifest.files) {
      assert.equal(typeof file, 'string');
      assert(!/[\\?#:\x00-\x1f\x7f]/.test(file) && /\.(md|json|txt)$/i.test(file), 'unsafe manifest entry: ' + file);
      assert(file.split('/').every(part => part && part !== '.' && part !== '..' && !['.git', 'node_modules', 'build', 'dist'].includes(part)));
      const resolved = path.resolve(root, file);
      assert(resolved.startsWith(root + path.sep), 'manifest path escaped repository');
      assert(fs.statSync(resolved).isFile(), 'manifest entry is not an existing file: ' + file);
    }
  });
  await check('static local text links use the reader and exact approved original paths', () => {
    let readerLinks = 0;
    for (const page of pages) for (const anchor of anchors(read(page))) {
      const href = anchor.attributes.href;
      // A same-document fragment (e.g. the reader's skip link) does not select a file.
      if (!href || href.startsWith('#')) continue;
      const url = new URL(href, 'https://atlas.test/' + page);
      if (url.origin !== 'https://atlas.test') continue;
      assert(!/\.(md|json|txt)$/i.test(url.pathname), page + ': raw text dead end: ' + href);
      if (url.pathname !== '/Delta-Atlas-Document.html') continue;
      readerLinks++;
      const files = url.searchParams.getAll('file');
      assert.equal(files.length, 1, page + ': reader requires one file');
      assert(manifest.files.includes(files[0]), page + ': document is not approved: ' + files[0]);
      assert(fs.statSync(path.join(root, files[0])).isFile(), page + ': original file is missing');
      assert.equal(anchor.attributes.target, '_top', page + ': reader link does not leave a possible embedded tool');
    }
    assert(readerLinks > 0, 'no document-reader links were found');
  });
  for (const [file, text, kind] of [['README.md', '# Atlas\nSource **text**.', 'Markdown'], ['terms.json', '{"message":"Atlas"}', 'JSON']]) {
    await check('actual reader loads approved ' + kind + ' as source text', async () => {
      const result = await runReader(reader, readerHTML, { query: '?file=' + file, text });
      assert.equal(result.state, 'ready');
      assert.equal(result.text, text);
      assert.equal(result.nodes['document-text'].hidden, false);
      assert.equal(result.nodes['content'].attributes['aria-busy'], 'false');
      assert(result.nodes['document-format'].textContent.includes(kind));
      assert.equal(result.documentRequests.length, 1);
      assert.equal(result.nodes['document-download'].href, 'https://atlas.test/' + file);
      for (const call of result.calls) {
        assert.equal(call.options.mode, 'same-origin');
        assert.equal(call.options.redirect, 'error');
        assert.equal(call.options.credentials, 'omit');
      }
    });
  }
  await check('HTML-shaped document remains literal text, with Home intact', async () => {
    const text = '<img src=x onerror="alert(1)"><script>throw Error("executed")</script>';
    const result = await runReader(reader, readerHTML, { text });
    assert.equal(result.state, 'ready');
    assert.equal(result.text, text);
    assert.equal(result.innerHTMLWrites, 0);
    assert(result.home);
  });
  for (const [name, query] of [
    ['missing query', ''], ['duplicate query', '?file=README.md&file=terms.json'],
    ['traversal', '?file=..%2FREADME.md'], ['external URL', '?file=https%3A%2F%2Fevil.test%2Fx.md'],
    ['absolute path', '?file=%2FREADME.md'], ['backslash', '?file=governance%5CREADME.md'],
    ['wrong extension', '?file=index.html'], ['NUL', '?file=README%00.md'],
  ]) {
    await check('reader rejects ' + name + ' before fetching', async () => {
      const result = await runReader(reader, readerHTML, { query });
      assert.equal(result.state, 'error');
      assert.equal(result.calls.length, 0);
      assert.equal(result.nodes['document-text'].hidden, true);
      assert(result.home);
    });
  }
  await check('syntactically valid but unlisted file cannot be fetched', async () => {
    const result = await runReader(reader, readerHTML, { query: '?file=private.md' });
    assert.equal(result.state, 'error');
    assert.equal(result.calls.length, 1);
    assert.equal(result.documentRequests.length, 0);
    assert.equal(result.nodes['document-download'].hidden, true);
  });
  for (const [name, invalid] of [
    ['invalid JSON', '{'], ['wrong identity', { type: 'other', version: 1, files: ['README.md'] }],
    ['wrong version', { type: 'delta-atlas-public-documents', version: 2, files: ['README.md'] }],
    ['non-array files', { type: 'delta-atlas-public-documents', version: 1, files: 'README.md' }],
    ['unsafe path', { type: 'delta-atlas-public-documents', version: 1, files: ['README.md', '../private.md'] }],
    ['non-string path', { type: 'delta-atlas-public-documents', version: 1, files: ['README.md', 1] }],
  ]) {
    await check('reader rejects manifest with ' + name, async () => {
      const result = await runReader(reader, readerHTML, { manifest: invalid });
      assert.equal(result.state, 'error');
      assert.equal(result.documentRequests.length, 0);
      assert(result.home);
    });
  }
  for (const [name, options] of [
    ['manifest network failure', { manifestThrows: true }],
    ['file network failure', { fileThrows: true }],
    ['file HTTP 404', { fileOptions: { ok: false, status: 404 } }],
  ]) {
    await check('reader retains recovery on ' + name, async () => {
      const result = await runReader(reader, readerHTML, options);
      assert.equal(result.state, 'error');
      assert.equal(result.nodes['content'].attributes['aria-busy'], 'false');
      assert.equal(result.nodes['document-text'].hidden, true);
      assert(result.home);
    });
  }
  await check('reader accepts the exact 1 MiB boundary', async () => {
    const text = 'a'.repeat(1024 * 1024);
    const result = await runReader(reader, readerHTML, { text, fileOptions: { length: String(text.length) } });
    assert.equal(result.state, 'ready');
    assert.equal(result.text.length, text.length);
    assert.equal(result.cancellations.length, 0);
  });
  for (const [name, fileOptions] of [
    ['oversized content-length', { length: String(1024 * 1024 + 1) }],
    ['oversized streamed body', { chunks: [new Uint8Array(600000), new Uint8Array(500000)] }],
  ]) {
    await check('reader bounds ' + name + ' while retaining Download and Home', async () => {
      const result = await runReader(reader, readerHTML, { fileOptions });
      assert.equal(result.state, 'large');
      assert.equal(result.nodes['document-text'].hidden, true);
      assert.equal(result.nodes['document-download'].hidden, false);
      assert(result.cancellations.length > 0);
      assert(result.home);
    });
  }
  console.log(`\n${passed}/${passed + failed} RETURN NAVIGATION checks hold`);
  console.log('Coverage: static anchors/link membership and mocked actual JavaScript behavior; no browser layout or universal accessibility claim.');
  process.exitCode = failed ? 1 : 0;
}
main().catch(error => { console.error('FAIL return-navigation harness could not load: ' + error.message); process.exitCode = 1; });
