// ivy-gen.js — deterministic ivy generator for index.html (zero deps, Node).
// Same seed, same output, every run. Run:  node ivy-gen.js
//
// Method: each vine is a Catmull-Rom spline through hand-set waypoints, sampled by
// arc length. Every leaf is attached to a sampled stem point via a short petiole and
// rotated to flow with the local tangent — attachment is guaranteed by construction.
// Stem ends are never visible: they exit the page edges or terminate hidden under a
// white panel (validated below; the script fails loudly if a rule breaks).
//
// Page geometry was measured in the browser at a 1280px viewport. Text and panels are
// center-anchored (the .wrap column is centered), the hero vine is center-anchored,
// and the margin vines are edge-anchored, so the relationships hold across viewports.
// Vines hide below 820px viewports via media query.

"use strict";
const fs = require("fs");
const path = require("path");

const HTML = path.join(__dirname, "index.html");
const SEED = 7;

/* ---------------- deterministic PRNG ---------------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(SEED);
const rr = (a, b) => a + (b - a) * rnd();
const pick = arr => arr[Math.floor(rnd() * arr.length) % arr.length];

/* ---------------- geometry helpers ---------------- */
// Catmull-Rom -> cubic Bezier segments
function catmullToBezier(pts) {
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  const segs = [];
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    segs.push([
      p1,
      [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
      p2
    ]);
  }
  return segs;
}
function bezPoint(s, t) {
  const [a, b, c, d] = s, u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]
  ];
}
// dense arc-length sampling: returns pts [{x,y,ang,s}] where ang = tangent angle (deg), s = arc length
function samplePath(waypoints, step) {
  const segs = catmullToBezier(waypoints);
  const raw = [];
  for (const s of segs) {
    for (let i = 0; i < 24; i++) raw.push(bezPoint(s, i / 24));
  }
  raw.push(waypoints[waypoints.length - 1].slice());
  // resample by arc length
  const out = [];
  let acc = 0, prev = raw[0];
  out.push({ x: prev[0], y: prev[1], s: 0 });
  for (let i = 1; i < raw.length; i++) {
    const dx = raw[i][0] - prev[0], dy = raw[i][1] - prev[1];
    acc += Math.hypot(dx, dy);
    prev = raw[i];
    if (acc - (out.length ? out[out.length - 1].s : 0) >= step || i === raw.length - 1) {
      out.push({ x: raw[i][0], y: raw[i][1], s: acc });
    }
  }
  for (let i = 0; i < out.length; i++) {
    const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)];
    out[i].ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  }
  return out;
}
function ptAt(samples, s) { // interpolate position+angle at arc length s
  if (s <= 0) return samples[0];
  const last = samples[samples.length - 1];
  if (s >= last.s) return last;
  let lo = 0, hi = samples.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; (samples[m].s <= s ? lo = m : hi = m); }
  const a = samples[lo], b = samples[hi], t = (s - a.s) / (b.s - a.s || 1);
  let da = b.ang - a.ang; if (da > 180) da -= 360; if (da < -180) da += 360;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ang: a.ang + da * t, s };
}
const D2R = Math.PI / 180;
const fmt = n => (Math.round(n * 10) / 10).toString();

/* ---------------- tapered ribbon stem ---------------- */
// decimate: keep every nth sample (plus the last) to keep markup lean
function decimate(samples, n) {
  const out = [];
  for (let i = 0; i < samples.length; i += n) out.push(samples[i]);
  if (out[out.length - 1] !== samples[samples.length - 1]) out.push(samples[samples.length - 1]);
  return out;
}
function ribbon(rawSamples, w0, w1, wobble) {
  const samples = decimate(rawSamples, 3);
  const L = rawSamples[rawSamples.length - 1].s;
  const left = [], right = [];
  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const t = p.s / L;
    const w = (w0 + (w1 - w0) * t) * (1 + wobble * Math.sin(p.s * 0.043 + w0));
    const nx = Math.cos((p.ang + 90) * D2R), ny = Math.sin((p.ang + 90) * D2R);
    left.push([p.x + nx * w / 2, p.y + ny * w / 2]);
    right.push([p.x - nx * w / 2, p.y - ny * w / 2]);
  }
  const d = ["M" + fmt(left[0][0]) + "," + fmt(left[0][1])];
  for (let i = 1; i < left.length; i++) d.push("L" + fmt(left[i][0]) + "," + fmt(left[i][1]));
  for (let i = right.length - 1; i >= 0; i--) d.push("L" + fmt(right[i][0]) + "," + fmt(right[i][1]));
  return d.join(" ") + " Z";
}
function centerlineD(rawSamples) {
  const samples = decimate(rawSamples, 4);
  const d = ["M" + fmt(samples[0].x) + "," + fmt(samples[0].y)];
  for (let i = 1; i < samples.length; i++) d.push("L" + fmt(samples[i].x) + "," + fmt(samples[i].y));
  return d.join(" ");
}

/* ---------------- palette / leaf variants ---------------- */
const SOLID = ["#16401C", "#1E5424", "#27632B", "#2F7031", "#1A5020"];
const YOUNG = ["#4E8A3E", "#5B9450"];
// variant: [bigRef, medRef] href ids
const VAR = {
  solid: ["#leafB2", "#leafM2"],
  sage: ["#leafB2a", "#leafM2a"],
  cream: ["#leafB2b", "#leafM2b"]
};
function leafVariant() {
  const r = rnd();
  if (r < 0.45) return "solid";
  if (r < 0.75) return "sage";
  if (r < 0.90) return "cream";
  return "young";
}

/* ---------------- avoid / hide rects ---------------- */
// center-relative page rects [x1,y1,x2,y2]  (x relative to wrap center, y = page y)
const AVOID_C = [
  [-115, 44, 115, 108],    // logo
  [-240, 118, 240, 158],   // headline
  [-335, 154, 335, 184],   // tagline
  [-312, 198, 312, 254],   // search
  [-378, 261, 378, 343],   // chips
  [-255, 616, 255, 646],   // substrip
  [-360, 655, 360, 683],   // statline 1
  [-420, 684, 420, 754],   // statline 2 (get the app) — mono text runs nearly full column
  [-418, 776, 418, 840],   // "Browse by area" + lead
  [-418, 2152, 418, 2214], // "Everyday tools" + lead
  [-418, 2614, 418, 2678], // "General tool" + lead
  [-418, 2888, 418, 2951], // "For evaluators" + lead
  [-418, 3162, 418, 3225]  // "Reference documents" + lead
];
const PANELS_C = [
  [-418, 394, -147, 607], [-135, 394, 135, 607], [147, 394, 418, 607], // doors
  [-418, 848, -147, 918], [-135, 848, 135, 918], [147, 848, 418, 918], // area tiles r1
  [-418, 930, -147, 1000], [-135, 930, 135, 1000], [147, 930, 418, 1000], // area tiles r2
  [-418, 1016, 418, 1176], [-418, 1191, 418, 1407], [-418, 1422, 418, 1615], // blocks 1-3
  [-418, 1630, 418, 1823], [-418, 1838, 418, 1976],                         // blocks 4-5
  [-418, 1997, 418, 2126],                                                  // jake
  [-418, 2223, -6, 2399], [6, 2223, 418, 2399], [-418, 2412, -6, 2589],     // tools cards
  [-418, 2686, -6, 2862], [6, 2686, 418, 2862],                             // general cards
  [-418, 2959, -6, 3136], [6, 2959, 418, 3136],                             // evaluator cards
  [-440, 3607, 440, 3836]                                                   // floor
];
const inRect = (x, y, r, inset) =>
  x >= r[0] + inset && x <= r[2] - inset && y >= r[1] + inset && y <= r[3] - inset;
const discHitsRect = (cx, cy, rad, r) => {
  const nx = Math.max(r[0], Math.min(cx, r[2])), ny = Math.max(r[1], Math.min(cy, r[3]));
  return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) < rad * rad;
};

/* ---------------- vine definitions ----------------
   Each vine: name, container CSS, viewBox, toLocal(cx,py)->[x,y] mapping from
   center-relative page coords, waypoints (local), stem widths, leaf plan, ends rule. */
const CENTER_X = 720; // hero: local x = centerRel + 720, local y = page y

const VINES = [
  {
    id: "hero",
    cls: "vine-hero",
    vb: [1440, 1600],
    toLocal: (cx, py) => [cx + CENTER_X, py],
    // (center-relative, pageY) — converted below
    waypointsC: [
      [-330, 1290], [-400, 1225], [-458, 1140], [-468, 1040], [-448, 948],
      [-466, 852], [-452, 764], [-436, 694], [-372, 620], [-306, 562],
      [-190, 498], [-60, 448], [60, 414], [141, 397], [235, 362],
      [350, 330], [405, 290], [445, 225], [470, 160], [500, 95],
      [525, 30], [548, -40]
    ],
    w0: 5.6, w1: 2.0,
    leaf: { step: 80, sMin: 0.26, sMax: 0.58, taper: true, bigProb: t => (t < 0.35 ? 0.5 : t < 0.7 ? 0.25 : 0.08) },
    startHidden: true, endHidden: false, // start under block 2, end exits top
    rootlets: true
  },
  {
    id: "heroBranchA",
    cls: null, parent: "hero",
    vb: null,
    toLocal: (cx, py) => [cx + CENTER_X, py],
    waypointsC: [
      [0, 430], [-45, 398], [-95, 368], [-150, 362], [-210, 378], [-245, 412], [-262, 450]
    ],
    w0: 2.6, w1: 1.4,
    leaf: { step: 58, sMin: 0.2, sMax: 0.3, taper: true, bigProb: () => 0 },
    startHidden: true, endHidden: true, rootlets: false
  },
  {
    id: "heroBranchB",
    cls: null, parent: "hero",
    vb: null,
    toLocal: (cx, py) => [cx + CENTER_X, py],
    waypointsC: [
      [-462, 1002], [-430, 952], [-388, 918], [-350, 895], [-320, 884]
    ],
    w0: 2.8, w1: 1.5,
    leaf: { step: 55, sMin: 0.22, sMax: 0.3, taper: true, bigProb: () => 0 },
    startHidden: true, endHidden: true, rootlets: false
  },
  {
    id: "left",
    cls: "vine-left",
    vb: [340, 900],
    // container at page left:-40, top:1350  ->  local = (pageX+40, pageY-1350)
    // center-relative -> page x = cx + 632 is viewport-dependent; margin vines use
    // absolute-left page coords at the 820px floor for avoid checks (conservative).
    toLocal: null, // waypoints given directly in local coords; hugs the LEFT edge
    waypoints: [
      [-25, 50], [50, 120], [120, 210], [175, 320], [190, 440], [150, 560],
      [80, 660], [40, 740], [95, 800], [160, 840], [110, 870], [30, 880], [-25, 870]
    ],
    w0: 4.6, w1: 4.0, tipAtStart: true, // enters at top: tip is the entry
    leaf: { step: 84, sMin: 0.26, sMax: 0.48, taper: true, bigProb: t => (t < 0.4 ? 0.35 : 0.1) },
    startHidden: false, endHidden: false, // both ends exit left page edge
    rootlets: true,
    // Edge-anchored: at the narrowest width it is SHOWN (>=1200px, see CSS) the center
    // text column's left edge maps to local x ~205. Exclude leaves at/inside that so an
    // edge vine can never slide over center text as the viewport narrows. Column-facing
    // side = high local x.
    avoidLocal: [[205, -99999, 999999, 999999]]
  },
  {
    id: "right",
    cls: "vine-right",
    vb: [400, 2950],
    toLocal: null, // hugs the RIGHT edge; drapes off top-right and bottom-right
    waypoints: [
      [430, 40], [360, 130], [300, 240], [255, 370], [270, 500], [330, 620],
      [360, 760], [320, 900], [260, 1040], [240, 1190], [285, 1340], [345, 1490],
      [330, 1650], [270, 1810], [240, 1970], [285, 2130], [345, 2290], [320, 2450],
      [265, 2600], [245, 2740], [300, 2850], [430, 2920]
    ],
    w0: 4.4, w1: 3.8, tipAtStart: true,
    leaf: { step: 126, sMin: 0.22, sMax: 0.44, taper: true, bigProb: t => (t > 0.55 ? 0.25 : 0.08) },
    startHidden: false, endHidden: false,
    rootlets: false,
    // Column-facing side = low local x. At >=1200px the column's right edge maps to
    // local x ~200; exclude leaves at/inside it. See the left vine for the rationale.
    avoidLocal: [[-99999, -99999, 200, 999999]]
  }
];

/* ---------------- leaf placement ---------------- */
function placeLeaves(vine, samples) {
  const L = samples[samples.length - 1].s;
  const plan = vine.leaf;
  const leaves = [];
  let s = rr(plan.step * 0.4, plan.step * 0.9);
  let side = rnd() < 0.5 ? 1 : -1;
  let skipped = 0;

  const localAvoid = [];
  if (vine.toLocal) for (const r of AVOID_C) {
    const a = vine.toLocal(r[0], r[1]), b = vine.toLocal(r[2], r[3]);
    localAvoid.push([a[0], a[1], b[0], b[1]]);
  }
  if (vine.avoidLocal) localAvoid.push(...vine.avoidLocal);

  const growthTipAtEnd = !vine.tipAtStart;

  while (s < L - plan.step * 0.35) {
    // occasional long bare stretch
    if (rnd() < 0.12) { s += plan.step * rr(1.7, 2.5); if (s >= L) break; }
    const cluster = rnd() < 0.18 ? (rnd() < 0.3 ? 3 : 2) : 1;
    for (let c = 0; c < cluster; c++) {
      const sc = Math.min(L - 4, s + (c === 0 ? 0 : rr(9, 20)));
      const p = ptAt(samples, sc);
      // taper toward the growing tip
      const t = sc / L;
      const tt = growthTipAtEnd ? t : 1 - t;
      let scale = (plan.sMax - (plan.sMax - plan.sMin) * (plan.taper ? tt : 0.5)) * rr(0.82, 1.14);
      if (c > 0) scale *= rr(0.6, 0.85);
      let variant = leafVariant();
      if (tt > 0.8 && rnd() < 0.5) variant = "young"; // pale young leaves near the tip
      // side: mostly alternate
      if (rnd() > 0.27) side = -side;
      const growthAng = growthTipAtEnd ? p.ang : p.ang + 180;

      // try side, flipped side, smaller, then skip
      let placed = null;
      for (const attempt of [0, 1, 2]) {
        const sd = attempt === 1 ? -side : side;
        const sscale = attempt === 2 ? scale * 0.78 : scale;
        const petAng = growthAng + sd * rr(55, 95);
        const petLen = 3 + sscale * rr(14, 22);
        const bx = p.x + Math.cos(petAng * D2R) * petLen;
        const by = p.y + Math.sin(petAng * D2R) * petLen;
        // tip flows with growth, leaning outward
        const tipAng = growthAng + sd * rr(24, 68) + rr(-8, 8);
        const cx0 = bx + Math.cos(tipAng * D2R) * 44 * sscale;
        const cy0 = by + Math.sin(tipAng * D2R) * 44 * sscale;
        const rad = 58 * sscale + 6; // covers rotated-bbox corners
        let bad = false;
        for (const r of localAvoid) {
          if (discHitsRect(cx0, cy0, rad, r) || discHitsRect(bx, by, 18 * sscale + 6, r)) { bad = true; break; }
        }
        if (!bad) {
          placed = { sx: p.x, sy: p.y, bx, by, petAng, petLen, tipAng, scale: sscale, sd, variant, t: tt, s: sc };
          break;
        }
      }
      if (placed) leaves.push(placed); else skipped++;
    }
    s += plan.step * rr(0.72, 1.45);
  }
  return { leaves, skipped };
}

function leafMarkup(lf) {
  const rot = lf.tipAng + 90; // leaf art points up; rotate tip to tipAng
  const petW = (1.6 * lf.scale + 0.7).toFixed(2);
  // petiole: slight curve
  const mx = lf.sx + Math.cos(lf.petAng * D2R) * lf.petLen * 0.5 + Math.cos((lf.petAng + 90) * D2R) * lf.petLen * 0.16 * lf.sd;
  const my = lf.sy + Math.sin(lf.petAng * D2R) * lf.petLen * 0.5 + Math.sin((lf.petAng + 90) * D2R) * lf.petLen * 0.16 * lf.sd;
  const pet = `<path d="M${fmt(lf.sx)},${fmt(lf.sy)} Q${fmt(mx)},${fmt(my)} ${fmt(lf.bx)},${fmt(lf.by)}" fill="none" stroke="#4E5A33" stroke-width="${petW}" stroke-linecap="round"/>`;
  let href, colorAttr = "";
  if (lf.variant === "young") {
    href = lf.big ? VAR.solid[0] : VAR.solid[1];
    colorAttr = ` color="${pick(YOUNG)}"`;
  } else {
    href = lf.big ? VAR[lf.variant][0] : VAR[lf.variant][1];
    if (lf.variant === "solid") colorAttr = ` color="${pick(SOLID)}"`;
  }
  const use = `<use href="${href}" transform="translate(${fmt(lf.bx)},${fmt(lf.by)}) rotate(${fmt(rot)}) scale(${lf.scale.toFixed(3)})"${colorAttr} data-ax="${fmt(lf.sx)}" data-ay="${fmt(lf.sy)}"/>`;
  return pet + use;
}

function rootletMarkup(samples, count) {
  const L = samples[samples.length - 1].s;
  const out = [];
  for (let i = 0; i < count; i++) {
    const p = ptAt(samples, rr(0.08, 0.92) * L);
    const a = p.ang + (rnd() < 0.5 ? 90 : -90) + rr(-25, 25);
    const l = rr(3, 6.5);
    out.push(`<path d="M${fmt(p.x)},${fmt(p.y)} q${fmt(Math.cos(a * D2R) * l * 0.6)},${fmt(Math.sin(a * D2R) * l * 0.6)} ${fmt(Math.cos(a * D2R) * l)},${fmt(Math.sin(a * D2R) * l)}" fill="none" stroke="#6E4B33" stroke-width="0.8" stroke-linecap="round" opacity="0.5"/>`);
  }
  return out.join("");
}

/* ---------------- build one vine group ---------------- */
function buildVine(vine) {
  const wps = vine.waypoints || vine.waypointsC.map(w => vine.toLocal(w[0], w[1]));
  const samples = samplePath(wps, 3);
  const { leaves, skipped } = placeLeaves(vine, samples);
  // mark big/med per leaf
  for (const lf of leaves) lf.big = rnd() < vine.leaf.bigProb(lf.t);
  const under = [], over = [];
  for (const lf of leaves) (rnd() < 0.25 ? under : over).push(lf);

  const dark = ribbon(samples, vine.w0, vine.w1, 0.07);
  const hi = ribbon(samples, vine.w0 * 0.42, vine.w1 * 0.42, 0.05);
  const parts = [];
  parts.push(`<path class="ivy-centerline" d="${centerlineD(samples)}" fill="none" stroke="none" data-vine="${vine.id}"/>`);
  parts.push(under.map(l => `<g opacity="0.92">${leafMarkup(l)}</g>`).join(""));
  parts.push(`<path d="${dark}" fill="#5A3D28"/>`);
  parts.push(`<path d="${hi}" fill="#82593B" opacity="0.85" transform="translate(-0.6,-0.8)"/>`);
  if (vine.rootlets) parts.push(rootletMarkup(samples, Math.round(samples[samples.length - 1].s / 260)));
  parts.push(over.map(leafMarkup).join(""));
  return { markup: parts.join("\n     "), samples, leaves, skipped, ends: [samples[0], samples[samples.length - 1]] };
}

/* ---------------- validation ---------------- */
function validate(vine, built, byId) {
  const errs = [];
  const [w, h] = vine.vb || VINES.find(v => v.id === vine.parent).vb;
  for (const [which, p] of [["start", built.ends[0]], ["end", built.ends[1]]]) {
    const hiddenReq = which === "start" ? vine.startHidden : vine.endHidden;
    const off = p.x < -12 || p.x > w + 12 || p.y < -12 || p.y > h + 12;
    if (which === "start" && vine.parent) {
      // a branch fork must sit on the parent stem
      let best = 1e9;
      for (const sp of byId[vine.parent].built.samples) {
        const d = Math.hypot(sp.x - p.x, sp.y - p.y);
        if (d < best) best = d;
      }
      if (best > 5) errs.push(`${vine.id} fork is ${best.toFixed(1)}px off the parent stem`);
      continue;
    }
    if (hiddenReq) {
      // must sit inside a panel rect (center-relative → local via toLocal)
      let ok = false;
      if (vine.toLocal) for (const r of PANELS_C) {
        const a = vine.toLocal(r[0], r[1]), b = vine.toLocal(r[2], r[3]);
        if (inRect(p.x, p.y, [a[0], a[1], b[0], b[1]], 12)) { ok = true; break; }
      }
      if (!ok) errs.push(`${vine.id} ${which} not hidden under a panel (${fmt(p.x)},${fmt(p.y)})`);
    } else if (!off) {
      errs.push(`${vine.id} ${which} visible in frame (${fmt(p.x)},${fmt(p.y)})`);
    }
  }
  // leaf anchors on stem (construction check): point-to-segment distance
  for (const lf of built.leaves) {
    if (distToPolyline(lf.sx, lf.sy, built.samples) > 0.75)
      errs.push(`${vine.id} leaf off stem by ${distToPolyline(lf.sx, lf.sy, built.samples).toFixed(2)}px`);
  }
  return errs;
}
function distToPolyline(x, y, pts) {
  let best = 1e9;
  for (let i = 1; i < pts.length; i++) {
    const ax = pts[i - 1].x, ay = pts[i - 1].y, bx = pts[i].x, by = pts[i].y;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
    const d = Math.hypot(x - (ax + dx * t), y - (ay + dy * t));
    if (d < best) best = d;
  }
  return best;
}

/* ---------------- SVG defs (leaf art) ---------------- */
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <path id="pBig" d="M50,97 C40,94 28,92 18,86 L8,78 C16,68 26,66 33,62 C24,54 17,44 14,32 L12,22 C22,22 31,26 38,28 C41,18 45,8 50,2 C55,8 59,18 62,28 C69,26 78,22 88,22 L86,32 C83,44 76,54 67,62 C74,66 84,68 92,78 L82,86 C72,92 60,94 50,97 Z"/>
  <path id="pMed" d="M50,96 C38,92 24,86 13,76 L9,68 C18,61 28,59 36,55 C31,40 34,20 44,8 L50,2 C56,8 66,20 64,40 C63,46 64,51 64,55 C72,59 82,61 91,68 L87,76 C76,86 62,92 50,96 Z"/>
  <clipPath id="cBig"><use href="#pBig"/></clipPath>
  <clipPath id="cMed"><use href="#pMed"/></clipPath>
  <radialGradient id="frost" cx="0.4" cy="0.34" r="0.62"><stop offset="0" stop-color="#eef6ea" stop-opacity="0.5"/><stop offset="0.6" stop-color="#eef6ea" stop-opacity="0.09"/><stop offset="1" stop-color="#eef6ea" stop-opacity="0"/></radialGradient>
  <radialGradient id="varSage" cx="0.5" cy="0.82" r="0.95"><stop offset="0" stop-color="#245D28"/><stop offset="0.52" stop-color="#2A6A2E"/><stop offset="0.8" stop-color="#7FA05B"/><stop offset="1" stop-color="#B9C99A"/></radialGradient>
  <radialGradient id="varCream" cx="0.5" cy="0.82" r="0.95"><stop offset="0" stop-color="#2F7031"/><stop offset="0.45" stop-color="#3B7A38"/><stop offset="0.75" stop-color="#A9BE85"/><stop offset="1" stop-color="#E9E6C9"/></radialGradient>
  <g id="veinsBig" stroke="#D6E7C9" fill="none" stroke-linecap="round">
    <path d="M50,88 C50,62 50,32 50,7" stroke-width="1.7"/>
    <path d="M50,84 C39,68 24,48 15,28" stroke-width="1.4"/>
    <path d="M50,84 C61,68 76,48 85,28" stroke-width="1.4"/>
    <path d="M50,86 C38,82 24,82 11,78" stroke-width="1.3"/>
    <path d="M50,86 C62,82 76,82 89,78" stroke-width="1.3"/>
    <g stroke-width="0.8" opacity="0.85">
      <path d="M50,58 C45,52 40,49 35,46"/><path d="M50,42 C46,38 43,36 39,33"/>
      <path d="M50,58 C55,52 60,49 65,46"/><path d="M50,42 C54,38 57,36 61,33"/>
      <path d="M39,73 C34,70 30,70 25,68"/><path d="M61,73 C66,70 70,70 75,68"/>
    </g>
  </g>
  <g id="veinsMed" stroke="#D6E7C9" fill="none" stroke-linecap="round">
    <path d="M50,88 C48,60 46,30 47,8" stroke-width="1.5"/>
    <path d="M50,84 C40,76 26,72 14,70" stroke-width="1.3"/>
    <path d="M50,84 C60,76 74,72 86,70" stroke-width="1.3"/>
    <g stroke-width="0.8" opacity="0.85"><path d="M48,50 C44,46 41,44 37,42"/><path d="M48,34 C51,30 54,28 57,26"/><path d="M49,64 C45,61 41,60 37,58"/></g>
  </g>
  <g id="leafBig">
    <use href="#pBig" fill="currentColor"/>
    <rect x="0" y="0" width="50" height="100" fill="#5B9450" opacity="0.22" clip-path="url(#cBig)"/>
    <use href="#veinsBig"/>
    <use href="#pBig" fill="url(#frost)"/>
    <use href="#pBig" fill="none" stroke="#0E2B12" stroke-width="1.1"/>
  </g>
  <g id="leafMed">
    <use href="#pMed" fill="currentColor"/>
    <rect x="0" y="0" width="50" height="100" fill="#5B9450" opacity="0.2" clip-path="url(#cMed)"/>
    <use href="#veinsMed"/>
    <use href="#pMed" fill="url(#frost)"/>
    <use href="#pMed" fill="none" stroke="#0E2B12" stroke-width="1.1"/>
  </g>
  <g id="leafBigA">
    <use href="#pBig" fill="url(#varSage)"/>
    <use href="#veinsBig"/>
    <use href="#pBig" fill="url(#frost)"/>
    <use href="#pBig" fill="none" stroke="#14361A" stroke-width="1.05"/>
  </g>
  <g id="leafMedA">
    <use href="#pMed" fill="url(#varSage)"/>
    <use href="#veinsMed"/>
    <use href="#pMed" fill="url(#frost)"/>
    <use href="#pMed" fill="none" stroke="#14361A" stroke-width="1.05"/>
  </g>
  <g id="leafBigB">
    <use href="#pBig" fill="url(#varCream)"/>
    <use href="#veinsBig"/>
    <use href="#pBig" fill="url(#frost)"/>
    <use href="#pBig" fill="none" stroke="#48583A" stroke-width="1"/>
  </g>
  <g id="leafMedB">
    <use href="#pMed" fill="url(#varCream)"/>
    <use href="#veinsMed"/>
    <use href="#pMed" fill="url(#frost)"/>
    <use href="#pMed" fill="none" stroke="#48583A" stroke-width="1"/>
  </g>
  <!-- base-anchored: origin = petiole end (the broad base). translate(x,y) rotate(tip) scale(s) -->
  <g id="leafB2"><use href="#leafBig" transform="translate(-50,-97)"/></g>
  <g id="leafM2"><use href="#leafMed" transform="translate(-50,-97)"/></g>
  <g id="leafB2a"><use href="#leafBigA" transform="translate(-50,-97)"/></g>
  <g id="leafM2a"><use href="#leafMedA" transform="translate(-50,-97)"/></g>
  <g id="leafB2b"><use href="#leafBigB" transform="translate(-50,-97)"/></g>
  <g id="leafM2b"><use href="#leafMedB" transform="translate(-50,-97)"/></g>
  <!-- shadow is CSS drop-shadow on .ivy (not an SVG filter): Safari can rasterize blank
       tiles for feDropShadow over large SVG canvases, showing white boxes on iPad. -->
</defs></svg>`;

const CSS = ` /* ivy layers: decorative only, never interactive. Generated by ivy-gen.js (deterministic, seed ${SEED}) */
 .ivy{position:absolute;pointer-events:none;filter:drop-shadow(-2px 3px 2px rgba(31,49,71,0.3));}
 .vine-hero{top:0;left:50%;width:1440px;margin-left:-720px;height:1600px;z-index:0;}
 .vine-left{left:-40px;top:1350px;width:340px;height:900px;z-index:0;}
 .vine-right{right:-40px;top:560px;width:400px;height:2950px;z-index:0;}
 /* The text column is capped at 880px wide, so for any viewport >=900px the layout is
    identical to the 1280px frame the ivy was calibrated against, and the center-anchored
    hero vine stays clear of text by construction. Below ~900px the column narrows and text
    reflows taller, drifting out from under the static leaf placement, so the hero hides.
    The side vines are edge-anchored and need real margin beside the column, so they show
    only on wide desktops (>=1200px). */
 @media (max-width:1199px){ .vine-left,.vine-right{display:none;} }
 @media (max-width:899px){ .vine-hero{display:none;} }`;

/* ---------------- generate ---------------- */
function main() {
  const allErrs = [];
  const byId = {};
  let totalLeaves = 0, totalSkipped = 0;
  for (const vine of VINES) {
    const built = buildVine(vine);
    byId[vine.id] = { vine, built };
    allErrs.push(...validate(vine, built, byId));
    totalLeaves += built.leaves.length;
    totalSkipped += built.skipped;
  }
  if (allErrs.length) {
    console.error("VALIDATION FAILED:\n" + allErrs.join("\n"));
    process.exit(1);
  }

  const heroInner = [byId.hero, byId.heroBranchA, byId.heroBranchB]
    .map(x => x.built.markup).join("\n     ");
  const svgHero = `<svg class="ivy vine-hero" viewBox="0 0 1440 1600" aria-hidden="true">\n     <g>\n     ${heroInner}\n     </g>\n   </svg>`;
  const svgLeft = `<svg class="ivy vine-left" viewBox="0 0 340 900" aria-hidden="true">\n     <g>\n     ${byId.left.built.markup}\n     </g>\n   </svg>`;
  const svgRight = `<svg class="ivy vine-right" viewBox="0 0 400 2950" aria-hidden="true">\n     <g>\n     ${byId.right.built.markup}\n     </g>\n   </svg>`;

  let html = fs.readFileSync(HTML, "utf8");

  // --- CSS block --- match the whole ivy CSS region up to the '/* hero */' boundary.
  // Boundary-anchored (not brace-counted) so it survives any number of @media rules.
  const cssRe = / \/\* ivy layers[\s\S]*?(?=\s*\/\* hero \*\/)/;
  if (!cssRe.test(html)) throw new Error("CSS anchor not found");
  html = html.replace(cssRe, CSS);

  // --- defs ---
  const defsRe = /<svg width="0" height="0"[\s\S]*?<\/defs><\/svg>/;
  if (!defsRe.test(html)) throw new Error("defs anchor not found");
  html = html.replace(defsRe, DEFS);

  // --- vines: replace existing hero+left pair (and right if present) ---
  const vinesRe = /<svg class="ivy vine-hero"[\s\S]*?<\/svg>\s*<svg class="ivy vine-left"[\s\S]*?<\/svg>(\s*<svg class="ivy vine-right"[\s\S]*?<\/svg>)?/;
  if (!vinesRe.test(html)) throw new Error("vine svg anchor not found");
  html = html.replace(vinesRe, `${svgHero}\n   ${svgLeft}\n   ${svgRight}`);

  // --- remove the old floating corner sprigs (ends dangled mid-frame) ---
  html = html.replace(/\s*<svg class="rup"[\s\S]*?<\/svg>/g, "");
  html = html.replace(/ \.rup\{[^}]*\}\n?/, "");
  // remove the small jake-note sprig too (floating end)
  html = html.replace(/\s*<svg class="ivy" style="right:-8px;top:-14px[\s\S]*?<\/svg>/, "");

  fs.writeFileSync(HTML, html);
  console.log(`OK seed=${SEED} leaves=${totalLeaves} skippedByTextGuard=${totalSkipped}`);
  for (const id of Object.keys(byId)) {
    const b = byId[id].built;
    console.log(`  ${id}: length=${Math.round(b.samples[b.samples.length - 1].s)}px leaves=${b.leaves.length}`);
  }
}
main();
