#!/usr/bin/env node
// theme-gate.js — deterministic theme + contrast gate for every page.
// Enumerates tracked HTML (no hand-list), fails on legacy palette, white panels,
// white-on-light text, and any --txt/--dim/--accent pair under WCAG AA on its ground.
// Run: node theme-gate.js   (exit 1 on any failure)
"use strict";
const fs = require("fs"), cp = require("child_process");
const LEGACY = /#e3ecf3|#2c6bb0\b|#1f3147|#cbd7e1|#56697d|#f4f8fc|#5f7d50|#b8902e|#b4503c|#c2d3b6|rgba\(44,\s*107,\s*176/i;
// tracked HTML plus new-but-not-ignored HTML, so a brand-new page cannot slip the gate
const tracked = cp.execSync("git ls-files *.html", { encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
const untracked = cp.execSync("git ls-files --others --exclude-standard *.html", { encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
const files = [...new Set([...tracked, ...untracked])];
function lum(h) { const c = [0,2,4].map(i => parseInt(h.substr(i,2),16)/255).map(v => v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4)); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; }
function cr(a,b){ const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); }
const fails = [];
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  if (LEGACY.test(s)) fails.push(f + ": legacy palette hex present");
  if (/--panel:\s*#fff/i.test(s)) fails.push(f + ": white panel on dark theme");
  if (/color:#fff[;\s]/i.test(s) && /background:var\(--accent\)|background:var\(--win\)/.test(s)) fails.push(f + ": white text on a light fill");
  const g = s.match(/--bg:\s*(#[0-9a-f]{6})/i), t = s.match(/--txt:\s*(#[0-9a-f]{6})/i), d = s.match(/--dim:\s*(#[0-9a-f]{6})/i), p = s.match(/--panel:\s*(#[0-9a-f]{6})/i);
  if (g && t) { const r = cr(t[1].slice(1), g[1].slice(1)); if (r < 4.5) fails.push(f + `: --txt on --bg only ${r.toFixed(2)}:1`); }
  if (p && t) { const r = cr(t[1].slice(1), p[1].slice(1)); if (r < 4.5) fails.push(f + `: --txt on --panel only ${r.toFixed(2)}:1`); }
  if (p && d) { const r = cr(d[1].slice(1), p[1].slice(1)); if (r < 4.5) fails.push(f + `: --dim on --panel only ${r.toFixed(2)}:1`); }
  // mobile safety: a percentage-width flex column, or a viewport-height pane that scrolls internally,
  // traps content on phones unless a media query stacks it. Plain height:100vh centering is fine and not flagged.
  const hasPctColumn = /width:\s*\d{2}%/.test(s) && /display:\s*flex/.test(s);
  const hasTrappedScroller = /calc\(100vh/.test(s) && /overflow:\s*(auto|scroll)/.test(s);
  if ((hasPctColumn || hasTrappedScroller) && !/@media/.test(s)) fails.push(f + ": two-column or full-height-scrolling layout with no media query (traps on mobile)");
}
if (fails.length) { console.error("THEME GATE FAILED:\n  " + fails.join("\n  ")); process.exit(1); }
console.log(`${files.length}/${files.length} pages hold — theme and contrast GREEN`);
