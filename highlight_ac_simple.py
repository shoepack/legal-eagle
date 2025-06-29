#!/usr/bin/env python3
"""
highlight_ac_simple.py

Highlights each invoice line-item containing an “Adjustments and Credit” block:
  1) Only the Time-keeper’s name (may span ≤5 lines), colour‐coded per keeper.
  2) The entire A&C block (one rectangle per page).

Uses rectangle highlights with a safe fallback to avoid any annotation‐binding errors.

Usage:
    python highlight_ac_simple.py input.pdf [output.pdf]
"""

import re, sys, itertools
from pathlib import Path
import pdfplumber, fitz

# ─────────────── patterns ─────────────────────────────────────
LI_PATTERN = re.compile(r'^\s*\d{1,3}\s+\d{1,2}/\d{1,2}/\d{4}')
DATE_RX    = re.compile(r'\d{1,2}/\d{1,2}/\d{4}')
TASK_RX    = re.compile(r'^[A-Za-z]\d{3}$')          # e.g. A104
AC_HEADER  = "Adjustments and Credit"

# Your custom six‐color palette (hex → normalized RGB)
PALETTE = [
    (0xFC/255, 0xF4/255, 0x85/255),  # #FCF485
    (0xC5/255, 0xFB/255, 0x72/255),  # #C5FB72
    (0x38/255, 0xE5/255, 0xFF/255),  # #38E5FF
    (0xDC/255, 0xAA/255, 0xFF/255),  # #DCAAFF
    (0xFF/255, 0xA9/255, 0x7B/255),  # #FFA97B
    (0xF8/255, 0x64/255, 0x64/255),  # #F86464
]

# ─────────────── helpers ─────────────────────────────────────
def clean(txt): return re.sub(r'\s+', ' ', txt.strip())

def rebuild_rows(page):
    words = page.extract_words(
        x_tolerance=1, y_tolerance=1, keep_blank_chars=False
    )
    rows = []
    for w in sorted(words, key=lambda w: (w['top'], w['x0'])):
        if not rows or abs(rows[-1][0]['top'] - w['top']) > 2:
            rows.append([w])
        else:
            rows[-1].append(w)
    return rows

def bbox(words):
    x0 = min(w['x0'] for w in words)
    y0 = min(w['top'] for w in words)
    x1 = max(w['x1'] for w in words)
    y1 = max(w['bottom'] for w in words)
    return x0, y0, x1, y1

def clip(rect, page):
    x0, y0, x1, y1 = rect
    x0, x1 = max(0, x0), min(page.rect.x1, x1)
    y0, y1 = max(0, y0), min(page.rect.y1, y1)
    if x1 - x0 < 0.5 or y1 - y0 < 0.5:
        return None
    return (x0, y0, x1, y1)

def safe_highlight(page, rect, color):
    """
    Try a highlight‐annot; if it returns None (no text under it),
    fall back to a rectangle annotation, then colour it.
    """
    annot = page.add_highlight_annot(rect)
    if annot is None:
        annot = page.add_rect_annot(rect)
    annot.set_colors(stroke=color)
    annot.update()

# ─────────────── parse invoice → line‐items ──────────────────
def parse_invoice(path):
    items, cur = [], None
    with pdfplumber.open(path) as pdf:
        all_rows = []
        for p, pg in enumerate(pdf.pages):
            for ridx, row in enumerate(rebuild_rows(pg)):
                txt = clean(" ".join(w['text'] for w in row))
                all_rows.append((p, ridx, row, txt))

        for p, ridx, row, txt in all_rows:
            if LI_PATTERN.match(txt):
                if cur:
                    items.append(cur)
                cur = {
                    "keeper_rows": [(p, ridx)],
                    "ac_rows": [], "ac_pages": set(),
                    "in_ac": False
                }
                continue
            if not cur:
                continue

            if not cur["in_ac"] and len(cur["keeper_rows"]) < 5:
                cur["keeper_rows"].append((p, ridx))

            if txt.startswith(AC_HEADER):
                cur["in_ac"] = True
            elif cur["in_ac"]:
                if LI_PATTERN.match(txt):
                    cur["in_ac"] = False
                else:
                    cur["ac_rows"].append((p, ridx))
                    cur["ac_pages"].add(p)

        if cur:
            items.append(cur)

    # only keep those with actual A&C rows
    return [it for it in items if it["ac_rows"]]

# ─────────────── main highlighting ───────────────────────────
def highlight(inp, out):
    items   = parse_invoice(inp)
    doc     = fitz.open(inp)
    plumber = pdfplumber.open(inp)

    keeper_colors = {}            # keeper_key → color
    keeper_keys   = []            # to preserve order
    pal           = itertools.cycle(PALETTE)

    for it in items:
        # -- determine keeper name words and normalized key --
        pg0, r0 = it["keeper_rows"][0]
        rows0    = rebuild_rows(plumber.pages[pg0])
        if r0 >= len(rows0):
            continue

        first_words = rows0[r0]
        texts       = [w["text"] for w in first_words]

        try:
            di = next(i for i,t in enumerate(texts) if DATE_RX.fullmatch(t))
            ti = next(i for i,t in enumerate(texts[di+1:], start=di+1)
                      if TASK_RX.fullmatch(t) or t == "Expense")
            name_words = first_words[di+1:ti]
            base_x0    = min(w["x0"] for w in name_words) if name_words else None

            # capture continuation rows aligned to same column
            for _pg, _r in it["keeper_rows"][1:]:
                if _pg != pg0 or _r >= len(rows0):
                    break
                cont = [w for w in rows0[_r] if abs(w["x0"] - base_x0) < 3]
                if not cont:
                    break
                name_words += cont
        except StopIteration:
            # fallback: whole first row
            name_words = first_words

        # normalize key: lowercase and strip punctuation
        keeper_key = " ".join(
            w["text"].strip(".,;:") for w in name_words
        ).lower()

        # assign (or reuse) colour
        if keeper_key not in keeper_colors:
            keeper_colors[keeper_key] = next(pal)
        color = keeper_colors[keeper_key]

        # -- highlight the keeper‐name rectangle --
        rect_name = clip(bbox(name_words), doc[pg0])
        if rect_name:
            safe_highlight(doc[pg0], rect_name, color)

        # -- highlight the A&C block on each page --
        for pg in sorted(it["ac_pages"]):
            rows_pg = rebuild_rows(plumber.pages[pg])
            words   = [
                w
                for (_p, ridx) in it["ac_rows"]
                if _p == pg and ridx < len(rows_pg)
                for w in rows_pg[ridx]
            ]
            if not words:
                continue
            rect_block = clip(bbox(words), doc[pg])
            if rect_block:
                safe_highlight(doc[pg], rect_block, color)

    doc.save(out, deflate=True)
    doc.close()
    plumber.close()

# ─────────────── CLI ─────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    inp = Path(sys.argv[1])
    out = Path(sys.argv[2] if len(sys.argv) > 2 else "output_simple.pdf")
    highlight(inp, out)
    print("Done →", out)
