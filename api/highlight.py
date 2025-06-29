from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
import tempfile
import os
from pathlib import Path
import sys
import shutil

# Add the current directory to Python path to import our highlight script
sys.path.append(os.path.dirname(__file__))

try:
    from highlight_ac_simple import highlight_invoice
except ImportError:
    # Fallback if import fails
    def highlight_invoice(input_path, output_path):
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
        highlight_invoice(str(input_path), str(output_path))

        if not output_path.exists():
            raise HTTPException(status_code=500, detail="Failed to create highlighted PDF")

        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="highlighted.pdf",
        )
    finally:
        # Clean up the temporary input file
        if input_path.exists():
            os.unlink(input_path)
