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
import re
import itertools
from pathlib import Path
from dataclasses import dataclass, field
import pdfplumber
import fitz

# ─────────────── Patterns ─────────────────────────────────────
LI_PATTERN = re.compile(r'^\s*\d{1,3}\s+\d{1,2}/\d{1,2}/\d{4}')
DATE_RX = re.compile(r'\d{1,2}/\d{1,2}/\d{4}')
TASK_RX = re.compile(r'^[A-Za-z]\d{3}$')  # e.g. A104
AC_HEADER = "Adjustments and Credit"

# ─────────────── Data Structures ──────────────────────────────
@dataclass
class LineItem:
    keeper_rows: list[list[dict]] = field(default_factory=list)
    ac_rows: list[list[dict]] = field(default_factory=list)
    pages: set[int] = field(default_factory=set)

    @property
    def ac_words(self):
        return [word for row in self.ac_rows for word in row]

    @property
    def first_page_num(self):
        if not self.keeper_rows:
            return None
        return self.keeper_rows[0][0]['page_number'] - 1

# ─────────────── Color Management ─────────────────────────────
class ColorManager:
    """Manages color assignments for keepers."""
    PALETTE = [
        (0xFC/255, 0xF4/255, 0x85/255),  # #FCF485
        (0xC5/255, 0xFB/255, 0x72/255),  # #C5FB72
        (0x38/255, 0xE5/255, 0xFF/255),  # #38E5FF
        (0xDC/255, 0xAA/255, 0xFF/255),  # #DCAAFF
        (0xFF/255, 0xA9/255, 0x7B/255),  # #FFA97B
        (0xF8/255, 0x64/255, 0x64/255),  # #F86464
    ]

    def __init__(self):
        self.keeper_colors = {}
        self.color_cycle = itertools.cycle(self.PALETTE)

    def get_color(self, keeper_key):
        if keeper_key not in self.keeper_colors:
            self.keeper_colors[keeper_key] = next(self.color_cycle)
        return self.keeper_colors[keeper_key]

# ─────────────── PDF Processing Helpers ───────────────────────
def clean(txt):
    return re.sub(r'\s+', ' ', txt.strip())

def rebuild_rows(page):
    """Rebuilds rows from words, adding page_number to each word."""
    words = page.extract_words(x_tolerance=1, y_tolerance=1, keep_blank_chars=False)
    rows = []
    for w in sorted(words, key=lambda w: (w['top'], w['x0'])):
        w['page_number'] = page.page_number
        if not rows or abs(rows[-1][0]['top'] - w['top']) > 2:
            rows.append([w])
        else:
            rows[-1].append(w)
    return rows

def bbox(words):
    if not words: return None
    x0 = min(w['x0'] for w in words)
    y0 = min(w['top'] for w in words)
    x1 = max(w['x1'] for w in words)
    y1 = max(w['bottom'] for w in words)
    return (x0, y0, x1, y1)

def clip(rect, page_rect):
    if rect is None: return None
    x0, y0, x1, y1 = rect
    x0, x1 = max(0, x0), min(page_rect.x1, x1)
    y0, y1 = max(0, y0), min(page_rect.y1, y1)
    if x1 - x0 < 0.5 or y1 - y0 < 0.5:
        return None
    return fitz.Rect(x0, y0, x1, y1)

def safe_highlight(page, rect, color):
    annot = page.add_highlight_annot(rect)
    if annot is None:
        annot = page.add_rect_annot(rect)
    annot.set_colors(stroke=color)
    annot.update()

# ─────────────── Core Logic ───────────────────────────────────
def parse_line_items(all_page_rows):
    items, current_item = [], None
    in_ac_block = False

    for row in (r for page_rows in all_page_rows for r in page_rows):
        row_text = clean(" ".join(w['text'] for w in row))

        if LI_PATTERN.match(row_text):
            if current_item:
                items.append(current_item)
            current_item = LineItem()
            in_ac_block = False

        if not current_item:
            continue

        # Capture keeper rows (up to 5 lines before A&C)
        if not in_ac_block and len(current_item.keeper_rows) < 5:
            current_item.keeper_rows.append(row)

        if row_text.startswith(AC_HEADER):
            in_ac_block = True
        elif in_ac_block:
            if LI_PATTERN.match(row_text):
                in_ac_block = False
            else:
                current_item.ac_rows.append(row)
                current_item.pages.add(row[0]['page_number'] - 1)

    if current_item:
        items.append(current_item)

    return [it for it in items if it.ac_rows]

def extract_keeper_name_words(item: LineItem):
    if not item.keeper_rows:
        return []

    first_row = item.keeper_rows[0]
    texts = [w["text"] for w in first_row]

    try:
        date_idx = next(i for i, t in enumerate(texts) if DATE_RX.fullmatch(t))
        task_idx = next(i for i, t in enumerate(texts[date_idx + 1:], start=date_idx + 1)
                        if TASK_RX.fullmatch(t) or t == "Expense")
        name_words = first_row[date_idx + 1:task_idx]
        base_x0 = min(w["x0"] for w in name_words) if name_words else None

        # Capture continuation rows
        if base_x0 is not None:
            for row in item.keeper_rows[1:]:
                # Ensure we are on the same page for continuation
                if row[0]['page_number'] - 1 != item.first_page_num:
                    break
                cont_words = [w for w in row if abs(w["x0"] - base_x0) < 3]
                if not cont_words:
                    break
                name_words.extend(cont_words)
        return name_words
    except StopIteration:
        return first_row # Fallback to the whole first row

def highlight_invoice(inp: Path, out: Path):
    doc = fitz.open(inp)
    with pdfplumber.open(inp) as plumber:
        # 1. Pre-process all pages once
        all_page_rows = [rebuild_rows(p) for p in plumber.pages]

    # 2. Parse line items from cached rows
    line_items = parse_line_items(all_page_rows)
    color_manager = ColorManager()

    for item in line_items:
        # 3. Extract keeper name and assign color
        name_words = extract_keeper_name_words(item)
        if not name_words:
            continue

        keeper_key = " ".join(
            w["text"].strip(".,;:") for w in name_words
        ).lower()
        color = color_manager.get_color(keeper_key)

        # 4. Highlight keeper name
        page_num = name_words[0]['page_number'] - 1
        page = doc[page_num]
        rect_name = clip(bbox(name_words), page.rect)
        if rect_name:
            safe_highlight(page, rect_name, color)

        # 5. Highlight A&C blocks
        for pg_idx in sorted(item.pages):
            ac_words_on_page = [w for w in item.ac_words if w['page_number'] - 1 == pg_idx]
            if not ac_words_on_page:
                continue
            
            page = doc[pg_idx]
            rect_block = clip(bbox(ac_words_on_page), page.rect)
            if rect_block:
                safe_highlight(page, rect_block, color)

    doc.save(out, deflate=True)
    doc.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python highlight_ac_simple.py input.pdf output.pdf")
        sys.exit(1)
    
    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    
    if not input_path.exists():
        print(f"Error: Input file {input_path} does not exist")
        sys.exit(1)
    
    try:
        highlight_invoice(input_path, output_path)
        print(f"Successfully processed {input_path} -> {output_path}")
    except Exception as e:
        print(f"Error processing PDF: {e}")
        sys.exit(1)
