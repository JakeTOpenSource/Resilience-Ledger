/* Public source-text reader. Exact manifest membership is required before a
 * document URL or download link is created. No storage, HTML parsing or API use. */
(() => {
  'use strict';
  const PREVIEW_LIMIT = 1024 * 1024;
  const MANIFEST_LIMIT = 256 * 1024;
  const EXCLUDED_SEGMENTS = new Set(['.git', 'node_modules', 'build', 'dist']);

  function validPath(value) {
    return typeof value === 'string' && value.length > 0 && value.length <= 1000 &&
      !/[\\?#:\u0000-\u001f\u007f]/.test(value) && /\.(?:md|json|txt)$/i.test(value) &&
      value.split('/').every(part => part && part !== '.' && part !== '..' && !EXCLUDED_SEGMENTS.has(part));
  }

  function sizeError() {
    const error = new Error('This file is larger than the 1 MiB preview limit. Use Download original to read the complete file.');
    error.code = 'PREVIEW_LIMIT';
    return error;
  }

  async function readLimited(response, limit) {
    const length = response.headers.get('content-length');
    if (length !== null && /^\d+$/.test(length) && Number(length) > limit) {
      if (response.body) await response.body.cancel().catch(() => {});
      throw sizeError();
    }
    if (!response.body) return '';
    if (typeof response.body.getReader !== 'function') {
      throw new Error('This browser cannot preview the file with a size limit. Use Download original instead.');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    const parts = [];
    let bytes = 0;
    try {
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > limit) {
          await reader.cancel().catch(() => {});
          throw sizeError();
        }
        parts.push(decoder.decode(chunk.value, { stream: true }));
      }
      parts.push(decoder.decode());
      return parts.join('');
    } finally {
      reader.releaseLock();
    }
  }

  async function request(url) {
    const response = await fetch(url, {
      mode: 'same-origin', credentials: 'omit', redirect: 'error',
    });
    if (!response.ok) throw new Error('The file could not be loaded (HTTP ' + response.status + ').');
    return response;
  }

  async function init() {
    const main = document.getElementById('content');
    const filename = document.getElementById('document-filename');
    const format = document.getElementById('document-format');
    const status = document.getElementById('document-status');
    const output = document.getElementById('document-text');
    const download = document.getElementById('document-download');
    if (!main || !filename || !format || !status || !output || !download) return;

    function report(state, message) {
      status.dataset.state = state;
      status.textContent = message;
    }

    const requested = new URLSearchParams(location.search).getAll('file');
    if (requested.length !== 1 || !validPath(requested[0])) {
      report('error', 'No valid document was selected. Choose a Markdown, JSON or text file from Atlas home or Library.');
      return;
    }
    const file = requested[0];
    main.setAttribute('aria-busy', 'true');
    report('loading', 'Checking the public document list.');
    let allowed;
    try {
      const manifestURL = new URL('assets/atlas-documents-v1.json', location.href);
      const manifest = JSON.parse(await readLimited(await request(manifestURL.href), MANIFEST_LIMIT));
      if (!manifest || manifest.type !== 'delta-atlas-public-documents' || manifest.version !== 1 ||
          !Array.isArray(manifest.files) || !manifest.files.every(validPath)) {
        throw new Error('Invalid public document list.');
      }
      allowed = new Set(manifest.files);
    } catch (_) {
      main.setAttribute('aria-busy', 'false');
      report('error', 'The public document list could not be loaded. Return to Atlas home or Library and try again.');
      return;
    }
    if (!allowed.has(file)) {
      main.setAttribute('aria-busy', 'false');
      report('error', 'That file is not in the public document list. Choose a file from Atlas home or Library.');
      return;
    }

    const url = new URL(file.split('/').map(encodeURIComponent).join('/'), location.href);
    if (url.origin !== location.origin) {
      main.setAttribute('aria-busy', 'false');
      report('error', 'The document must be a public file on this Atlas site.');
      return;
    }
    filename.textContent = file;
    document.title = file + ' - Delta Atlas';
    const kind = /\.md$/i.test(file) ? 'Markdown' : /\.json$/i.test(file) ? 'JSON' : 'Plain text';
    format.textContent = kind + ' source text. Links and markup are displayed as text. Download original preserves the file itself.';
    download.href = url.href;
    download.download = file.split('/').pop();
    download.hidden = false;
    report('loading', 'Loading ' + file + '.');
    try {
      const text = await readLimited(await request(url.href), PREVIEW_LIMIT);
      output.textContent = text;
      output.hidden = false;
      report('ready', text.length ? 'Document loaded. Preview limit: 1 MiB.' : 'This document is empty.');
    } catch (error) {
      report(error.code === 'PREVIEW_LIMIT' ? 'large' : 'error',
        error.code === 'PREVIEW_LIMIT' ? error.message : 'The document could not be previewed. Try Download original, or return to Atlas home or Library.');
    } finally {
      main.setAttribute('aria-busy', 'false');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
