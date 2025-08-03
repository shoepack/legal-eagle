#!/usr/bin/env python3
"""
highlight_counsellink.py · rev J  – border-less highlights

• Uses Highlight annotations (page.add_highlight_annot)  
• Custom colour + opacity, but zero outline  
• Text underneath remains perfectly crisp thanks to Multiply blend
"""

from __future__ import annotations
import sys, re, itertools, pdfplumber, fitz
from typing import Dict, List, Tuple

# ── palette ────────────────────────────────────────────────────────────────
hex2rgb = lambda h: [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
YELLOW  = hex2rgb("FFED99")
PASTELS = list(map(hex2rgb, ("FFCCD8", "C3F0A9", "AFF5FF", "FFC69A")))
next_pastel = itertools.cycle(PASTELS)

# ── patterns & layout ───────────────────────────────────────────────────────
SEC_RE  = re.compile(r"Client Adjusted Charges Summary", re.I)
CRL_RE  = re.compile(r"^CRL\w+", re.I)
ROW_RE  = re.compile(r"^\d+\s+\d{2}/\d{2}/\d{4}\s+[A-Z]{2,5}\b")
DATE_RE = re.compile(r"\d{2}/\d{2}/\d{4}")
INIT_RE = re.compile(r"^[A-Z]{2,5}$")
ROW_TOL, HEADER_LEFT = 2.0, 150     # spacing heuristics

# ── helpers ────────────────────────────────────────────────────────────────
def group_rows(words, tol=ROW_TOL):
    """Yield lists of words that share the same baseline (≈ same y-coord)."""
    words = sorted(words, key=lambda w: (w["top"], w["x0"]))
    buf, top = [], None
    for w in words:
        if top is None or abs(w["top"] - top) <= tol:
            buf.append(w); top = w["top"] if top is None else top
        else:
            yield sorted(buf, key=lambda x: x["x0"]); buf, top = [w], w["top"]
    if buf:
        yield sorted(buf, key=lambda x: x["x0"])

def bbox(ws, pad=0.3):
    """Tight-ish bounding box around a list of pdfplumber word dicts."""
    return fitz.Rect(
        min(w["x0"] for w in ws) - pad,
        min(w["top"] for w in ws) - pad,
        max(w["x1"] for w in ws) + pad,
        max(w["bottom"] for w in ws) + pad,
    )

def paint(page: fitz.Page, rect: fitz.Rect,
          colour: Tuple[float, float, float], alpha: float = 0.80):
    """
    Add a real Highlight annotation (no outline, Multiply blend).
    
    colour → use as “stroke” because that’s the channel Highlight annots respect.
    """
    annot = page.add_highlight_annot(rect)
    annot.set_colors(stroke=colour)   # sets the highlight colour
    annot.set_opacity(alpha)          # make it pop (adjust as you like)
    annot.update()

# ── main routine ───────────────────────────────────────────────────────────
def highlight(src="input.pdf", dst="output.pdf"):
    pastel_of: Dict[str, Tuple[float, float, float]] = {}
    with pdfplumber.open(src) as pl_doc, fitz.open(src) as mu_doc:
        in_sec = in_hdr = False
        for pl_pg, mu_pg in zip(pl_doc.pages, mu_doc):
            for row in group_rows(pl_pg.extract_words()):
                text = " ".join(w["text"] for w in row).strip()

                # enter section
                if not in_sec:
                    in_sec = bool(SEC_RE.search(text))
                    continue

                # ── CRL header (yellow) ───────────────────────────────
                if CRL_RE.match(text): in_hdr = True
                if in_hdr and not ROW_RE.match(text):
                    if row[0]["x0"] < HEADER_LEFT:
                        paint(mu_pg, bbox(row), YELLOW)
                    continue
                if in_hdr and ROW_RE.match(text): in_hdr = False

                # ── body rows (date + initials, same pastel) ──────────
                if ROW_RE.match(text):
                    date_w = next((w for w in row if DATE_RE.fullmatch(w["text"])), None)
                    init_w = next((w for w in row
                                   if date_w and w["x0"] > date_w["x1"]
                                   and INIT_RE.fullmatch(w["text"])), None)
                    if not (date_w and init_w):
                        continue

                    col = pastel_of.setdefault(init_w["text"], next(next_pastel))
                    paint(mu_pg, bbox([date_w]), col)
                    paint(mu_pg, bbox([init_w]), col)

        mu_doc.save(dst, garbage=4, deflate=True)

# ── CLI ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) == 1:
        highlight()                       # input.pdf → output.pdf
    elif len(sys.argv) == 3:
        highlight(sys.argv[1], sys.argv[2])
    else:
        sys.exit("Usage:  python highlight_counsellink.py [in.pdf out.pdf]")
