"""Vector figures for the paper.

Every figure is emitted as standalone SVG so the PDF renders them as vectors
rather than resampled bitmaps. Colors are chosen to survive grayscale printing:
every color-coded element also carries a text label or a distinct stroke style.
"""

from __future__ import annotations

from html import escape
from pathlib import Path

OUT = Path(__file__).resolve().parent / "figures"
OUT.mkdir(parents=True, exist_ok=True)

INK = "#101828"
MUTED = "#5A6474"
RULE = "#C9D0DA"
SURFACE = "#F4F6F9"
ACCENT = "#1D4E89"
ACCENT_SOFT = "#E3ECF6"
PASS = "#2C6E49"
PASS_SOFT = "#E1EFE7"
HOLD = "#9A5B0B"
HOLD_SOFT = "#F7EBD7"
STOP = "#A32E22"
STOP_SOFT = "#F7E2DF"
PAPER = "#FFFFFF"

SERIF = "Constantia, Cambria, Georgia, serif"
SANS = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
MONO = "Consolas, 'Cascadia Mono', monospace"


def head(
    w: int,
    h: int,
    figure_id: str,
    accessible_title: str,
    accessible_description: str,
) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'width="{w}" height="{h}" font-family="{SANS}" role="img" '
        f'aria-labelledby="{figure_id}-title {figure_id}-desc">'
        f'<title id="{figure_id}-title">{escape(accessible_title)}</title>'
        f'<desc id="{figure_id}-desc">{escape(accessible_description)}</desc>'
        '<defs>'
        f'<marker id="{figure_id}-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" '
        f'markerHeight="7" orient="auto-start-reverse">'
        f'<path d="M0,0 L10,5 L0,10 z" fill="{ACCENT}"/></marker>'
        f'<marker id="{figure_id}-arm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" '
        f'markerHeight="7" orient="auto-start-reverse">'
        f'<path d="M0,0 L10,5 L0,10 z" fill="{MUTED}"/></marker>'
        '</defs>'
    )


def title(t: str, sub: str, w: int) -> str:
    return (
        f'<text x="0" y="22" font-size="21" font-weight="600" fill="{INK}">{t}</text>'
        f'<text x="0" y="46" font-size="17" fill="{MUTED}">{sub}</text>'
        f'<line x1="0" y1="59" x2="{w}" y2="59" stroke="{RULE}" stroke-width="1"/>'
    )


def box(x, y, w, h, label, sub="", fill=ACCENT_SOFT, stroke=ACCENT, tc=INK, fs=15.5):
    out = (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="{fill}" '
        f'stroke="{stroke}" stroke-width="1.2"/>'
    )
    cy = y + h / 2 + (0 if not sub else -5)
    out += (
        f'<text x="{x + w / 2}" y="{cy + 4}" font-size="{fs}" font-weight="600" '
        f'text-anchor="middle" fill="{tc}">{label}</text>'
    )
    if sub:
        out += (
            f'<text x="{x + w / 2}" y="{cy + 20}" font-size="13.5" '
            f'text-anchor="middle" fill="{MUTED}">{sub}</text>'
        )
    return out


# --------------------------------------------------------------------------
# Figure 1. Where the proposer sits
# --------------------------------------------------------------------------
def figure1() -> str:
    W, H = 1180, 470
    s = head(
        W,
        H,
        "fig1",
        "The boundary around a probabilistic proposer",
        "A proposer supplies a candidate to a deterministic gate. The gate records "
        "stage receipts, replays an accepted projection, acts on the external world "
        "only through an authorized effect, and observes that world through a "
        "declared instrument.",
    )
    s += '<g transform="translate(20,14)">'
    s += title(
        "The boundary around a probabilistic proposer",
        "The proposer suggests. A separate path decides, acts, observes, and accepts.",
        1140,
    )
    s += '</g>'

    # world band
    s += (
        f'<rect x="20" y="88" width="1140" height="74" rx="6" fill="{SURFACE}" '
        f'stroke="{RULE}" stroke-width="1" stroke-dasharray="5 4"/>'
    )
    s += (
        f'<text x="40" y="114" font-size="16" font-weight="600" fill="{INK}">'
        'External world</text>'
    )
    s += (
        f'<text x="40" y="138" font-size="14.5" fill="{MUTED}">'
        'Partly hidden. Changing. Never read directly, only through a declared '
        'instrument that has its own limits.</text>'
    )

    # effect arrow: up into the world, on the left
    s += (
        f'<path d="M400,206 L400,164" stroke="{MUTED}" stroke-width="1.4" '
        f'stroke-dasharray="5 4" marker-end="url(#fig1-arm)" fill="none"/>'
    )
    s += (
        f'<text x="392" y="188" font-size="14" text-anchor="end" fill="{MUTED}">'
        'authorized effect</text>'
    )

    # observation arrow: down out of the world, on the right
    s += (
        f'<path d="M760,164 L760,206" stroke="{MUTED}" stroke-width="1.4" '
        f'marker-end="url(#fig1-arm)" fill="none"/>'
    )
    s += (
        f'<text x="772" y="188" font-size="14" fill="{MUTED}">'
        'qualified observation</text>'
    )

    # protocol boundary
    s += (
        f'<rect x="20" y="208" width="1140" height="212" rx="8" fill="{PAPER}" '
        f'stroke="{ACCENT}" stroke-width="1.6"/>'
    )
    s += (
        f'<text x="40" y="233" font-size="14" font-weight="600" fill="{ACCENT}" '
        f'letter-spacing="0.7">PROTOCOL BOUNDARY</text>'
    )

    # the deterministic span, tinted so the caption can point at it
    s += (
        f'<rect x="316" y="244" width="800" height="104" rx="7" fill="{ACCENT_SOFT}" '
        f'stroke="{ACCENT}" stroke-width="0.8" stroke-dasharray="3 3"/>'
    )
    s += (
        f'<text x="716" y="368" font-size="13.5" text-anchor="middle" fill="{ACCENT}" '
        f'letter-spacing="0.5">the tinted span is the whole of the determinism claim</text>'
    )

    s += box(44, 256, 200, 80, "Proposer", "model, person, or program",
             fill=SURFACE, stroke=MUTED)
    s += (
        f'<path d="M244,296 L306,296" stroke="{ACCENT}" stroke-width="1.6" '
        f'marker-end="url(#fig1-ar)" fill="none"/>'
    )
    s += (
        f'<text x="275" y="286" font-size="13" text-anchor="middle" fill="{MUTED}">'
        'candidate</text>'
    )

    s += box(328, 256, 192, 80, "Deterministic gate", "pinned policy and schemas")
    s += (
        f'<path d="M520,296 L582,296" stroke="{ACCENT}" stroke-width="1.6" '
        f'marker-end="url(#fig1-ar)" fill="none"/>'
    )

    s += box(586, 256, 204, 80, "Append-only receipts", "one record per stage")
    s += (
        f'<path d="M790,296 L852,296" stroke="{ACCENT}" stroke-width="1.6" '
        f'marker-end="url(#fig1-ar)" fill="none"/>'
    )
    s += (
        f'<text x="821" y="286" font-size="13" text-anchor="middle" fill="{MUTED}">'
        'replay</text>'
    )

    s += box(856, 256, 248, 80, "Accepted projection", "a governance state",
             fill=PASS_SOFT, stroke=PASS)

    s += (
        f'<text x="40" y="402" font-size="14" fill="{MUTED}">'
        'Pinned bytes in, projection out. The proposer that produced the candidate '
        'and the world the effect lands in both sit outside it.</text>'
    )

    s += '</svg>'
    return s


# --------------------------------------------------------------------------
# Figure 2. Lifecycle
# --------------------------------------------------------------------------
def figure2() -> str:
    W, H = 1180, 420
    stages = [
        "PROPOSE", "NORMALIZE", "CHECK", "AUTHORIZE", "PREPARE",
        "EXECUTE", "OBSERVE", "ACCEPT", "OUTCOME", "CORRECT",
    ]
    s = head(
        W,
        H,
        "fig2",
        "The proposed ten-stage lifecycle",
        "Ten conceptual stages run from proposal through correction. Refusal and "
        "unresolved are recorded exits at every stage. Acceptance is the only "
        "state-update gate. A correction starts a new governed transition and can "
        "change state only after a new acceptance record.",
    )
    s += '<g transform="translate(20,18)">'
    s += title(
        "The proposed ten-stage lifecycle",
        "Conceptual profile. ACCEPT changes state; CORRECT begins a new transition and cannot bypass acceptance.",
        1140,
    )
    s += '</g>'

    s += (
        f'<rect x="1036" y="78" width="120" height="25" rx="4" fill="{HOLD_SOFT}" '
        f'stroke="{HOLD}" stroke-width="1"/>'
        f'<text x="1096" y="95" font-size="13" font-weight="700" '
        f'text-anchor="middle" fill="{HOLD}">PROPOSED</text>'
    )

    x0, gap, bw, bh, y = 24, 115.6, 104, 60, 120
    for i, name in enumerate(stages):
        x = x0 + i * gap
        is_accept = name == "ACCEPT"
        is_correct = name == "CORRECT"
        s += box(
            x, y, bw, bh, name, f"stage {i + 1}",
            fill=PASS_SOFT if is_accept else HOLD_SOFT if is_correct else ACCENT_SOFT,
            stroke=PASS if is_accept else HOLD if is_correct else ACCENT,
            fs=13.5,
        )
        if i < len(stages) - 1:
            s += (
                f'<path d="M{x + bw},{y + bh / 2} L{x + gap - 2},{y + bh / 2}" '
                f'stroke="{ACCENT}" stroke-width="1.3" marker-end="url(#fig2-ar)" fill="none"/>'
            )
        # drop lines to the exit rail
        s += (
            f'<path d="M{x + bw / 2},{y + bh} L{x + bw / 2},{y + bh + 34}" '
            f'stroke="{RULE}" stroke-width="1" stroke-dasharray="3 3" fill="none"/>'
        )

    # accept emphasis
    s += (
        f'<text x="{x0 + 7 * gap + bw / 2}" y="{y - 10}" font-size="13" '
        f'text-anchor="middle" fill="{PASS}" font-weight="600">'
        'state-update gate</text>'
    )

    rail = y + bh + 34
    s += (
        f'<line x1="{x0 + bw / 2}" y1="{rail}" x2="{x0 + 9 * gap + bw / 2}" y2="{rail}" '
        f'stroke="{MUTED}" stroke-width="1.2"/>'
    )

    # exits
    s += box(150, rail + 30, 300, 62, "REFUSE",
             "a required check is decisively false",
             fill=STOP_SOFT, stroke=STOP, fs=15)
    s += box(560, rail + 30, 300, 62, "UNRESOLVED",
             "required evidence is unknown, stale, or errored",
             fill=HOLD_SOFT, stroke=HOLD, fs=15)

    s += (
        f'<path d="M300,{rail} L300,{rail + 28}" stroke="{STOP}" stroke-width="1.4" '
        f'marker-end="url(#fig2-ar)" fill="none"/>'
    )
    s += (
        f'<path d="M710,{rail} L710,{rail + 28}" stroke="{HOLD}" stroke-width="1.4" '
        f'marker-end="url(#fig2-ar)" fill="none"/>'
    )

    s += (
        f'<text x="24" y="{rail + 124}" font-size="14" fill="{MUTED}">'
        'Both exits are recorded and kept. Neither advances the accepted projection.</text>'
    )
    s += (
        f'<text x="24" y="{rail + 147}" font-size="14" fill="{MUTED}">'
        'CORRECT appends a requested supersession and starts a new governed transition.</text>'
    )
    s += (
        f'<text x="24" y="{rail + 170}" font-size="14" fill="{MUTED}">'
        'It changes state only after a new ACCEPT record; it never edits the prior record.</text>'
    )

    s += '</svg>'
    return s


# --------------------------------------------------------------------------
# Figure 3. Three stores
# --------------------------------------------------------------------------
def figure3() -> str:
    W, H = 1180, 450
    s = head(
        W,
        H,
        "fig3",
        "Three stores with three retention rules",
        "The minimized event history follows an additions-only protocol rule. "
        "Detecting rewrites requires an authenticated current tip. Restricted raw "
        "evidence and the redacted public projection follow separate retention rules.",
    )
    s += '<g transform="translate(20,18)">'
    s += title(
        "Three stores, three retention rules",
        "The event protocol permits additions only; rewrite detection requires an authenticated current tip.",
        1140,
    )
    s += '</g>'

    cols = [
        ("Event history", "minimized", ACCENT, ACCENT_SOFT, [
            "Typed status and commitments.",
            "Protocol rule: additions only.",
            "Rewrite detection requires an",
            "authenticated current tip.",
        ]),
        ("Evidence store", "restricted", HOLD, HOLD_SOFT, [
            "The material a check actually read.",
            "Access controlled. Retention bounded.",
            "Deletable, and deletion is recorded.",
        ]),
        ("Public projection", "redacted", PASS, PASS_SOFT, [
            "Only what an owner released.",
            "Rebuilt, not edited, on change.",
            "Allowlisted bytes with digests.",
        ]),
    ]
    x = 24
    for name, tag, stroke, fill, lines in cols:
        s += (
            f'<rect x="{x}" y="98" width="360" height="246" rx="7" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="1.3"/>'
        )
        s += (
            f'<text x="{x + 22}" y="133" font-size="18" font-weight="600" fill="{INK}">'
            f'{name}</text>'
        )
        s += (
            f'<text x="{x + 22}" y="158" font-size="14" fill="{stroke}" '
            f'letter-spacing="0.7" font-weight="600">{tag.upper()}</text>'
        )
        for j, ln in enumerate(lines):
            s += (
                f'<text x="{x + 22}" y="{191 + j * 28}" font-size="15" fill="{INK}">'
                f'{ln}</text>'
            )
        x += 384

    s += (
        f'<text x="24" y="381" font-size="14" fill="{MUTED}">'
        'An erasure record can remain in the event history after the restricted object '
        'is destroyed. Hashing a personal record does not anonymize it,</text>'
    )
    s += (
        f'<text x="24" y="404" font-size="14" fill="{MUTED}">'
        'and a deletion receipt does not by itself establish legal compliance.</text>'
    )
    s += '</svg>'
    return s


# --------------------------------------------------------------------------
# Figure 4. Six signals
# --------------------------------------------------------------------------
def figure4() -> str:
    W, H = 1180, 430
    s = head(
        W,
        H,
        "fig4",
        "Six evidence conditions reported separately",
        "Protocol calibration, consequence, evidence, integrity, privacy, and "
        "activity each retain a typed status. No combined score is used.",
    )
    s += '<g transform="translate(20,18)">'
    s += title(
        "Six conditions reported separately, rather than averaged into one score",
        "A single score would let a strong dimension conceal the one that mattered.",
        1140,
    )
    s += '</g>'

    items = [
        ("Protocol calibration", ("Did every required check pass,", "with nothing unresolved?")),
        ("Consequence", ("Is a named consequence active", "under the pinned policy?")),
        ("Evidence", ("How much required evidence", "came back decisive?")),
        ("Integrity", ("Do the recorded bytes still hash", "to their commitments?")),
        ("Privacy", ("Did anything cross the declared", "disclosure boundary?")),
        ("Activity", ("What has moved recently,", "and what has gone quiet?")),
    ]
    for i, (name, q_lines) in enumerate(items):
        cx = 24 + (i % 3) * 384
        cy = 98 + (i // 3) * 126
        s += (
            f'<rect x="{cx}" y="{cy}" width="360" height="108" rx="7" fill="{PAPER}" '
            f'stroke="{RULE}" stroke-width="1.2"/>'
        )
        s += (
            f'<rect x="{cx}" y="{cy}" width="5" height="108" rx="2.5" fill="{ACCENT}"/>'
        )
        s += (
            f'<text x="{cx + 22}" y="{cy + 28}" font-size="17" font-weight="600" '
            f'fill="{INK}">{name}</text>'
        )
        for j, q in enumerate(q_lines):
            s += (
                f'<text x="{cx + 22}" y="{cy + 52 + j * 18}" font-size="14" '
                f'fill="{MUTED}">{q}</text>'
            )
        s += (
            f'<text x="{cx + 22}" y="{cy + 97}" font-size="13" fill="{MUTED}" '
            f'font-family="{MONO}">PASS / FAIL / UNKNOWN / STALE / ERROR / N-A</text>'
        )

    s += (
        f'<text x="24" y="371" font-size="14" fill="{MUTED}">'
        'Every color is paired with a text label and a reason code, so the display '
        'survives grayscale printing and color vision deficiency.</text>'
    )
    s += (
        f'<text x="24" y="394" font-size="14" fill="{MUTED}">'
        'The display is a projection of the record. The record remains canonical.</text>'
    )
    s += '</svg>'
    return s


# --------------------------------------------------------------------------
# Figure 5. Repair loop
# --------------------------------------------------------------------------
def figure5() -> str:
    W, H = 1180, 380
    s = head(
        W,
        H,
        "fig5",
        "The seven-step repair pattern used in the case study",
        "The case-study repairs freeze bytes, state the claim, construct a minimal "
        "false pass, add a rejecting contract, pin a regression test, preserve the "
        "correction, and state the remaining limit.",
    )
    s += '<g transform="translate(20,18)">'
    s += title(
        "The repair pattern, which ends in a stated limit rather than a clean bill",
        "Every correction in the case study followed these seven steps in this order.",
        1140,
    )
    s += '</g>'

    steps = [
        ("1", "Freeze", "pin the exact bytes under review"),
        ("2", "State", "write the claim being tested"),
        ("3", "Break", "build the smallest false pass"),
        ("4", "Type", "add a contract that rejects it"),
        ("5", "Pin", "add a regression or mutation test"),
        ("6", "Keep", "record the correction, delete nothing"),
        ("7", "Bound", "state what remains outside the check"),
    ]
    x0, gap, bw = 24, 163.5, 148
    for i, (n, name, sub) in enumerate(steps):
        x = x0 + i * gap
        last = i == len(steps) - 1
        s += (
            f'<rect x="{x}" y="98" width="{bw}" height="104" rx="6" '
            f'fill="{HOLD_SOFT if last else PAPER}" '
            f'stroke="{HOLD if last else ACCENT}" stroke-width="1.3"/>'
        )
        s += (
            f'<circle cx="{x + 24}" cy="{124}" r="13" fill="{HOLD if last else ACCENT}"/>'
        )
        s += (
            f'<text x="{x + 24}" y="{129}" font-size="14" font-weight="700" '
            f'text-anchor="middle" fill="{PAPER}">{n}</text>'
        )
        s += (
            f'<text x="{x + 46}" y="{129}" font-size="16.5" font-weight="600" '
            f'fill="{INK}">{name}</text>'
        )
        words = sub.split()
        lines, cur = [], ""
        for w in words:
            if len(cur) + len(w) + 1 > 17:
                lines.append(cur)
                cur = w
            else:
                cur = f"{cur} {w}".strip()
        lines.append(cur)
        for j, ln in enumerate(lines[:3]):
            s += (
                f'<text x="{x + 14}" y="{158 + j * 18}" font-size="13.5" '
                f'fill="{MUTED}">{ln}</text>'
            )
        if not last:
            s += (
                f'<path d="M{x + bw},150 L{x + gap - 2},150" stroke="{ACCENT}" '
                f'stroke-width="1.3" marker-end="url(#fig5-ar)" fill="none"/>'
            )

    s += (
        f'<path d="M{x0 + 6 * gap + bw / 2},202 L{x0 + 6 * gap + bw / 2},236 '
        f'L{x0 + bw / 2},236 L{x0 + bw / 2},202" stroke="{MUTED}" stroke-width="1.3" '
        f'stroke-dasharray="4 4" marker-end="url(#fig5-arm)" fill="none"/>'
    )
    s += (
        f'<text x="{W / 2}" y="260" font-size="14" text-anchor="middle" '
        f'fill="{MUTED}">the stated limit becomes the next claim to test</text>'
    )
    s += (
        f'<text x="24" y="312" font-size="14" fill="{MUTED}">'
        'In these case-study corrections, the omitted step was the minimal false-pass test. '
        'A check that was never attacked has only been asserted.</text>'
    )
    s += '</svg>'
    return s


FIGURES = {
    "fig1-boundary.svg": figure1,
    "fig2-lifecycle.svg": figure2,
    "fig3-stores.svg": figure3,
    "fig4-signals.svg": figure4,
    "fig5-repair.svg": figure5,
}


def main() -> None:
    for name, fn in FIGURES.items():
        (OUT / name).write_text(fn(), encoding="utf-8")
        print(f"wrote {name}")


if __name__ == "__main__":
    main()
