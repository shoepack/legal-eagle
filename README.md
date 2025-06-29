# LegalUtils - Invoice Highlighter

This script, `highlight_ac_simple.py`, is a Python tool for processing PDF invoices. It automatically identifies and highlights specific sections within an invoice to make reviewing easier.

## Features

- **Time-Keeper Highlighting**: The script identifies the name of the time-keeper on each line item and highlights it. Each time-keeper is assigned a unique color, making it easy to distinguish their entries at a glance.
- **Adjustments and Credit Block Highlighting**: For any line item that contains an "Adjustments and Credit" section, the entire block is highlighted with a single rectangle. The color of this rectangle matches the color assigned to the time-keeper for that line item.

This tool is designed to streamline the review of legal or other professional service invoices where tracking adjustments and individual contributions is important.

## Dependencies

This script relies on the following Python libraries:

- `PyMuPDF` (for PDF manipulation)
- `pdfplumber` (for PDF data extraction)

## Installation

Before running the script, you need to install the required libraries. You can do this using pip:

```bash
pip install PyMuPDF pdfplumber
```

## Usage

You can run the script from the command line, providing the input PDF file as an argument. Optionally, you can also specify an output file name.

**Basic Usage:**

```bash
python highlight_ac_simple.py input.pdf
```

This will process `input.pdf` and create a new file named `output_simple.pdf` in the same directory with the specified highlights.

**Specifying an Output File:**

```bash
python highlight_ac_simple.py input.pdf my_highlighted_invoice.pdf
```

This will create the output file with the name `my_highlighted_invoice.pdf`.

## How It Works

The script processes the PDF page by page:

1.  **Text Extraction**: It uses `pdfplumber` to extract all words and their precise locations from the PDF.
2.  **Line Item Parsing**: It identifies distinct line items based on common invoice formatting patterns.
3.  **A&C Block Detection**: It looks for the "Adjustments and Credit" header to find relevant sections.
4.  **Keeper Identification**: It extracts the time-keeper's name associated with each line item.
5.  **Highlighting**: It uses `PyMuPDF` to draw colored highlight annotations on a new PDF file for both the time-keeper's name and the A&C block. A safe fallback to a simple rectangle annotation is used to prevent errors with malformed PDFs.
