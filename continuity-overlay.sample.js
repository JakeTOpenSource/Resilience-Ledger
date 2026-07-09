/**
 * continuity-overlay.sample.js — TEMPLATE for a private household/organization overlay.
 *
 * To use: copy this file to  continuity-overlay.local.js  (same folder) and fill in your
 * real household's terms, vendor-access rules, and red flags. The .local.js name
 * matters: .gitignore already blocks *.local.js, so a private overlay can never be
 * committed or leak through a public fork.
 *
 * The craft generalizes; the stories don't ship. This file is where a specific
 * household's real names, vendors, and procedures belong — NEVER in the public
 * Delta-Atlas-ContinuityAudit.html knowledge base, which stays generic on purpose.
 *
 * Additive only, same rule as every other overlay in this project: it can only ADD
 * terms, relations, and red flags on top of the public floor. It cannot remove or
 * weaken anything the public knowledge base already checks.
 *
 * Loaded automatically by Delta-Atlas-ContinuityAudit.html if present (one harmless
 * failed fetch if not — nothing breaks either way).
 *
 * Shape — window.CONTINUITY_OVERLAY = { terms, relations, redFlags, bridge }:
 *   terms:     same shape as the base KB — { id, name, purpose:'risk'|'control'|'concept',
 *              cluster, acct, aliases:[...] }
 *   relations: [[fromId, toId, relType]] — relType one of mitigates/checks/detects/governs
 *   redFlags:  [{ t, d, re, need? }] — re is a RegExp, need is an optional second RegExp
 *   bridge:    { termId: ['everyday phrase', ...] }
 */
window.CONTINUITY_OVERLAY = {
  terms: [
    // { id:'example-real-vendor-risk', name:'Example: unescorted pool contractor', purpose:'risk',
    //   cluster:'Access & Vendor Control', acct:'', aliases:['pool contractor','pool service'] },
  ],
  relations: [
    // ['example-real-control-id', 'example-real-vendor-risk', 'mitigates'],
  ],
  redFlags: [
    // { t:'Example: specific vendor named without an escort requirement',
    //   d:'Your household\'s own note about why this matters.',
    //   re:/pool (contractor|service)/i },
  ],
  bridge: {
    // 'least-privilege-access': ['the way we do it at the lake house'],
  },
};
