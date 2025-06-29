from http.server import BaseHTTPRequestHandler
import tempfile
from pathlib import Path
import highlight_ac_simple
import cgi
import io
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Parse the multipart form data
            content_type = self.headers.get('content-type', '')
            if not content_type.startswith('multipart/form-data'):
                self.send_error(400, "Expected multipart/form-data")
                return
            
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "No content provided")
                return
                
            post_data = self.rfile.read(content_length)
            
            # Parse the form data
            form = cgi.FieldStorage(
                fp=io.BytesIO(post_data),
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST'}
            )
            
            # Get the uploaded file
            if 'file' not in form:
                self.send_error(400, "No file field found")
                return
                
            file_item = form['file']
            if not hasattr(file_item, 'filename') or not file_item.filename:
                self.send_error(400, "No file uploaded")
                return
            
            # Save uploaded file to temp location
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_input_file:
                tmp_input_file.write(file_item.file.read())
                tmp_input_path = Path(tmp_input_file.name)

            # Create temp output file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_output_file:
                tmp_output_path = Path(tmp_output_file.name)

            # Process the PDF
            highlight_ac_simple.highlight_invoice(tmp_input_path, tmp_output_path)
            
            # Read the processed file
            with open(tmp_output_path, 'rb') as f:
                pdf_data = f.read()
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/pdf')
            self.send_header('Content-Disposition', 'attachment; filename="highlighted.pdf"')
            self.send_header('Content-Length', str(len(pdf_data)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(pdf_data)
            
            # Clean up temp files
            tmp_input_path.unlink()
            tmp_output_path.unlink()
            
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
