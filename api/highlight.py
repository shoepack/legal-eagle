from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
import tempfile
import os
from pathlib import Path
import sys
import shutil
import logging
import importlib.metadata

# Configure logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

def get_library_versions():
    """Get versions of all libraries from requirements.txt for debugging deployment issues"""
    requirements_libraries = [
        'fastapi',
        'python-multipart',
        'uvicorn',
        'pdfplumber',
        'PyMuPDF',
        'pypdf'
    ]
    
    versions = {}
    for lib in requirements_libraries:
        try:
            # Handle special cases for library name differences
            if lib == 'python-multipart':
                version = importlib.metadata.version('python-multipart')
            elif lib == 'PyMuPDF':
                version = importlib.metadata.version('PyMuPDF')
            else:
                version = importlib.metadata.version(lib)
            versions[lib] = version
        except importlib.metadata.PackageNotFoundError:
            versions[lib] = "NOT FOUND"
        except Exception as e:
            versions[lib] = f"ERROR: {str(e)}"
    
    return versions

def log_library_versions():
    """Log versions of all libraries from requirements.txt for debugging deployment issues"""
    versions = get_library_versions()
    log.info("=== LIBRARY VERSIONS DEBUG INFO ===")
    for lib, version in versions.items():
        log.info(f"{lib}: {version}")
    log.info("=== END LIBRARY VERSIONS ===")

# Log library versions on startup
log_library_versions()

# Add the current directory to Python path to import our highlight scripts
sys.path.append(os.path.dirname(__file__))

try:
    from highlight_ac_simple import highlight_invoice as highlight_t360
    log.info("Successfully imported highlight_t360 from highlight_ac_simple")
except ImportError as e:
    log.error(f"Failed to import highlight_t360: {e}")
    # Fallback if import fails
    def highlight_t360(input_path, output_path, title=None):
        log.info("Using fallback highlight_t360 (file copy)")
        # Simple fallback - just copy the file
        shutil.copy2(input_path, output_path)

try:
    from highlight_counsellink import highlight_counsellink_invoice
    log.info("Successfully imported highlight_counsellink_invoice from highlight_counsellink")
except ImportError as e:
    log.error(f"Failed to import highlight_counsellink_invoice: {e}")
    # Fallback if import fails
    def highlight_counsellink_invoice(input_path, output_path, title=None):
        log.info("Using fallback highlight_counsellink_invoice")
        raise HTTPException(status_code=501, detail="CounselLink highlighting not available")

app = FastAPI()

@app.get("/python-api/debug/versions")
async def debug_versions():
    """Debug endpoint to check library versions - accessible in browser"""
    versions = get_library_versions()
    return {
        "message": "Library versions installed on Vercel",
        "versions": versions,
        "python_version": sys.version,
        "platform": sys.platform
    }

@app.post("/python-api/highlight")
async def process_pdf_endpoint(file: UploadFile = File(...), platform: str = Form(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    if not platform:
        raise HTTPException(status_code=400, detail="Platform selection is required")
    
    log.info(f"Processing PDF for platform: {platform}")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_input_file:
        shutil.copyfileobj(file.file, tmp_input_file)
        input_path = Path(tmp_input_file.name)

    output_path = input_path.with_suffix(".highlighted.pdf")

    try:
        # Extract the original filename to use as the title
        original_filename = file.filename or "highlighted.pdf"
        log.info(f"Processing file: {input_path} -> {output_path} with title {original_filename}")
        
        # Route to appropriate highlighter based on platform
        if platform == "T360":
            log.info("Routing to T360 highlighter")
            highlight_t360(str(input_path), str(output_path), title=original_filename)
        elif platform == "CounselLink":
            log.info("Routing to CounselLink highlighter")
            highlight_counsellink_invoice(str(input_path), str(output_path), title=original_filename)
        else:
            log.error(f"Unsupported platform: {platform}")
            raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")
        
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
    except HTTPException:
        # Re-raise HTTP exceptions (like the CounselLink 501 error)
        raise
    except Exception as e:
        log.error(f"An error occurred during highlighting: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during highlighting.")
    finally:
        # Clean up the temporary input file
        if input_path.exists():
            log.info(f"Cleaning up temporary file: {input_path}")
            os.unlink(input_path)
