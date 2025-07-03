from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
import tempfile
import os
from pathlib import Path
import sys
import shutil
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# Add the current directory to Python path to import our highlight script
sys.path.append(os.path.dirname(__file__))

try:
    from highlight_ac_simple import highlight_invoice
    log.info("Successfully imported highlight_invoice from highlight_ac_simple")
except ImportError as e:
    log.error(f"Failed to import highlight_invoice: {e}")
    # Fallback if import fails
    def highlight_invoice(input_path, output_path):
        log.info("Using fallback highlight_invoice (file copy)")
        # Simple fallback - just copy the file
        shutil.copy2(input_path, output_path)

app = FastAPI()

@app.post("/python-api/highlight")
async def process_pdf_endpoint(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_input_file:
        shutil.copyfileobj(file.file, tmp_input_file)
        input_path = Path(tmp_input_file.name)

    output_path = input_path.with_suffix(".highlighted.pdf")

    try:
        # Extract the original filename to use as the title
        original_filename = file.filename or "highlighted.pdf"
        log.info(f"Processing file: {input_path} -> {output_path} with title {original_filename}")
        highlight_invoice(str(input_path), str(output_path), title=original_filename)
        log.info(f"Finished processing. Checking for output file at {output_path}")

        if not output_path.exists():
            log.error("Output file not found after processing")
            raise HTTPException(status_code=500, detail="Failed to create highlighted PDF")

        log.info(f"Returning highlighted file: {output_path}")
        # Use the original filename for the downloaded file
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename=original_filename,
        )
    except Exception as e:
        log.error(f"An error occurred during highlighting: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during highlighting.")
    finally:
        # Clean up the temporary input file
        if input_path.exists():
            log.info(f"Cleaning up temporary file: {input_path}")
            os.unlink(input_path)
