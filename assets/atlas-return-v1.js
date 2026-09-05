/* Progressive enhancement only: the native Home link works without this script. */
(() => {
  'use strict';
  const root = document.documentElement;
  const nav = document.querySelector('nav.atlas-return-nav');
  if (!nav) return;
  try {
    if (window.parent !== window &&
        window.parent.document.documentElement.dataset.atlasShell === 'true') {
      root.dataset.atlasReturnEmbedded = 'true';
      nav.hidden = true;
    }
  } catch (_) {
    // Unrecognized/cross-origin embeds retain the standalone recovery link.
  }
  if (nav.hidden || root.dataset.atlasReturnLayout === 'field') return;
  const layout = root.dataset.atlasReturnLayout;
  const header = (layout === 'query' || layout === 'primitives')
    ? document.querySelector('body > header') : null;
  function measure() {
    root.style.setProperty('--atlas-return-height', nav.getBoundingClientRect().height + 'px');
    if (header) root.style.setProperty('--atlas-return-header-height', header.getBoundingClientRect().height + 'px');
  }
  measure();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    if (header) observer.observe(header);
  } else {
    window.addEventListener('resize', measure);
  }
})();
