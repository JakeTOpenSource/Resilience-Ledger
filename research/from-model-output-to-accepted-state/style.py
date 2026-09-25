"""Print stylesheet for the paper.

Targets Chrome's print engine. Letter, single column, generous measure.
Every status color is paired with a text label so the page survives grayscale.
"""

CSS = r"""
@page {
  size: Letter;
  margin: 19mm 20mm 20mm 20mm;
  @bottom-center { content: counter(page); }
}
@page :first { margin-top: 24mm; }

:root {
  --ink: #101828;
  --body: #1C2534;
  --muted: #5A6474;
  --faint: #8A93A1;
  --rule: #D5DAE2;
  --hair: #E7EAEF;
  --surface: #F5F7FA;
  --accent: #1D4E89;
  --accent-soft: #E8F0F8;
  --pass: #2C6E49;
  --hold: #9A5B0B;
  --stop: #A32E22;
  --serif: Constantia, Cambria, Georgia, "Times New Roman", serif;
  --sans: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --mono: Consolas, "Cascadia Mono", "Courier New", monospace;
}

* { box-sizing: border-box; }

body {
  font-family: var(--serif);
  font-size: 10.4pt;
  line-height: 1.52;
  color: var(--body);
  margin: 0;
  hyphens: auto;
  -webkit-hyphens: auto;
  text-rendering: optimizeLegibility;
  widows: 3;
  orphans: 3;
}

p { margin: 0 0 8.5pt; text-align: justify; }
p.lead { text-align: left; }

/* ---------------------------------------------------------------- title */
.title-block { margin-bottom: 16pt; }
.eyebrow {
  font-family: var(--sans);
  font-size: 7.6pt;
  letter-spacing: 1.5pt;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 600;
  margin-bottom: 9pt;
}
h1.title {
  font-family: var(--serif);
  font-size: 25pt;
  line-height: 1.14;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 5pt;
  letter-spacing: -0.3pt;
}
.subtitle {
  font-size: 13pt;
  color: var(--muted);
  font-style: italic;
  margin: 0 0 14pt;
}
.byline {
  font-family: var(--sans);
  font-size: 9pt;
  color: var(--body);
  border-top: 1.4pt solid var(--ink);
  border-bottom: 0.5pt solid var(--rule);
  padding: 7pt 0;
  margin-bottom: 14pt;
}
.byline strong { color: var(--ink); }
.byline .meta { color: var(--faint); }

/* ------------------------------------------------------------- headings */
h2 {
  font-family: var(--sans);
  font-size: 13pt;
  font-weight: 600;
  color: var(--ink);
  margin: 20pt 0 7pt;
  padding-bottom: 3.5pt;
  border-bottom: 0.8pt solid var(--rule);
  break-after: avoid;
  letter-spacing: -0.15pt;
}
h2 .num {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  margin-right: 7pt;
  font-weight: 700;
}
h3 {
  font-family: var(--sans);
  font-size: 10.4pt;
  font-weight: 600;
  color: var(--ink);
  margin: 13pt 0 5pt;
  break-after: avoid;
}
h4 {
  font-family: var(--sans);
  font-size: 9.4pt;
  font-weight: 600;
  color: var(--accent);
  margin: 11pt 0 4pt;
  break-after: avoid;
  letter-spacing: 0.2pt;
}

/* -------------------------------------------------------------- abstract */
.abstract {
  background: var(--surface);
  border-left: 2.5pt solid var(--accent);
  padding: 11pt 14pt 4pt;
  margin: 0 0 13pt;
  font-size: 9.8pt;
}
.abstract h4 { margin-top: 0; }

/* ---------------------------------------------------------------- chips */
.chip {
  display: inline-block;
  font-family: var(--sans);
  font-size: 6.9pt;
  font-weight: 700;
  letter-spacing: 0.8pt;
  padding: 1.3pt 4.5pt;
  border-radius: 2.5pt;
  vertical-align: 1.5pt;
  white-space: nowrap;
  border: 0.6pt solid;
}
.chip-tested   { color: #1F5137; background: #E4F0E9; border-color: #9EC4AF; }
.chip-observed { color: #1B4771; background: #E4EEF8; border-color: #A3BEDB; }
.chip-proposed { color: #7A4708; background: #F8EEDC; border-color: #D9BC8A; }
.chip-open     { color: #7E251B; background: #F8E6E3; border-color: #DDAAA3; }

/* --------------------------------------------------------------- tables */
table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--sans);
  font-size: 8.6pt;
  margin: 9pt 0 5pt;
  break-inside: auto;
  page-break-inside: auto;
}
caption {
  caption-side: top;
  text-align: left;
  font-family: var(--sans);
  font-size: 8.6pt;
  color: var(--muted);
  padding-bottom: 4pt;
  line-height: 1.4;
  break-inside: avoid;
  page-break-inside: avoid;
  break-after: avoid;
}
caption b { color: var(--ink); font-weight: 600; }
th {
  text-align: left;
  font-weight: 600;
  color: var(--ink);
  border-bottom: 1pt solid var(--ink);
  padding: 4pt 6pt 3.5pt;
  vertical-align: bottom;
}
td {
  padding: 3.6pt 6pt;
  border-bottom: 0.5pt solid var(--hair);
  vertical-align: top;
  color: var(--body);
}
tbody tr:last-child td { border-bottom: 0.8pt solid var(--rule); }
thead { display: table-header-group; }
tfoot { display: table-footer-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
td.mono {
  font-family: var(--mono);
  font-size: 7.9pt;
  overflow-wrap: anywhere;
  word-break: break-all;
}
tr.total td { font-weight: 700; color: var(--ink); border-top: 0.8pt solid var(--rule); }
.artifact-index { font-size: 7.9pt; line-height: 1.3; }
.artifact-index td { padding-top: 2.2pt; padding-bottom: 2.2pt; }
.artifact-index td.mono { font-size: 7.3pt; }
.tnote {
  font-family: var(--sans);
  font-size: 8.1pt;
  color: var(--muted);
  margin: 2pt 0 10pt;
  line-height: 1.45;
}

/* ------------------------------------------------------------- formulas */
.formula {
  border-left: 2pt solid var(--accent);
  background: #FBFCFD;
  padding: 8pt 12pt;
  margin: 9pt 0;
  break-inside: avoid;
}
.formula .eq {
  font-family: var(--mono);
  font-size: 9.2pt;
  color: var(--ink);
  line-height: 1.62;
  white-space: pre-wrap;
}
.formula .where {
  font-family: var(--sans);
  font-size: 8pt;
  color: var(--muted);
  margin-top: 5pt;
  line-height: 1.48;
}
.formula .where b { color: var(--ink); font-weight: 600; }

/* --------------------------------------------------------------- blocks */
.callout {
  border: 0.8pt solid var(--rule);
  border-top: 2pt solid var(--accent);
  background: #FCFDFE;
  padding: 9pt 13pt 3pt;
  margin: 11pt 0;
  break-inside: avoid;
}
.callout h4 { margin-top: 0; }
.callout.split { break-inside: auto; }
.callout.warn { border-top-color: var(--hold); }
.callout.warn h4 { color: var(--hold); }
.callout.stop { border-top-color: var(--stop); }
.callout.stop h4 { color: var(--stop); }

blockquote {
  margin: 9pt 0;
  padding: 0 0 0 12pt;
  border-left: 2pt solid var(--rule);
  color: var(--muted);
  font-style: italic;
}
blockquote p { text-align: left; }

ul, ol { margin: 0 0 8.5pt; padding-left: 15pt; }
li { margin-bottom: 3.5pt; }
li::marker { color: var(--accent); }

code {
  font-family: var(--mono);
  font-size: 8.6pt;
  color: var(--ink);
  background: var(--surface);
  padding: 0.5pt 2.5pt;
  border-radius: 2pt;
}
.digest { font-family: var(--mono); font-size: 8pt; color: var(--accent); }
a {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-thickness: 0.5pt;
  text-underline-offset: 1.2pt;
  overflow-wrap: anywhere;
}
a:visited { color: var(--accent); }

/* -------------------------------------------------------------- figures */
figure { margin: 12pt 0; break-inside: avoid; }
figure img { width: 100%; height: auto; display: block; }
figure svg {
  width: 100%;
  height: auto;
  display: block;
  margin-left: 0;
}
figcaption {
  font-family: var(--sans);
  font-size: 8pt;
  color: var(--muted);
  margin-top: 5pt;
  line-height: 1.45;
}
figcaption b { color: var(--ink); font-weight: 600; }

/* ----------------------------------------------------------- references */
.refs { font-size: 8.7pt; line-height: 1.46; }
.refs ol { padding-left: 17pt; }
.refs li { margin-bottom: 3.6pt; break-inside: avoid; }
.refs .src { color: var(--faint); font-family: var(--mono); font-size: 8pt; }

.footer-note {
  font-family: var(--sans);
  font-size: 7.8pt;
  color: var(--faint);
  border-top: 0.5pt solid var(--rule);
  padding-top: 6pt;
  margin-top: 16pt;
}

.break { break-before: page; }
#methods { break-before: auto; }
.avoid { break-inside: avoid; }
h2, h3, h4 { page-break-after: avoid; }
"""
