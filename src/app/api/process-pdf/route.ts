import { NextRequest, NextResponse } from "next/server";

const DEBUG = true; // Set to false to disable debug logging

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log(...args);
  }
}

function debugError(...args: any[]) {
  if (DEBUG) {
    console.error(...args);
  }
}

export async function POST(request: NextRequest) {
  debugLog("DEBUG API: POST request received");

  try {
    debugLog("DEBUG API: Parsing form data...");
    const formData = await request.formData();
    const file = formData.get("file") as File;

    debugLog(
      "DEBUG API: File received:",
      file ? file.name : "null",
      file ? file.size : "null"
    );

    if (!file) {
      debugLog("DEBUG API: No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    debugLog("DEBUG API: File type:", file.type);
    if (file.type !== "application/pdf") {
      debugLog("DEBUG API: Invalid file type");
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    debugLog("DEBUG API: File size:", file.size, "Max size:", maxSize);
    if (file.size > maxSize) {
      debugLog("DEBUG API: File too large");
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Forward the file to the Python backend
    const pythonApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/highlight`;
    debugLog("DEBUG API: Forwarding to Python API:", pythonApiUrl);

    const response = await fetch(pythonApiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      debugError("DEBUG API: Python API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Processing failed: ${errorText}` },
        { status: response.status }
      );
    }

    const responseBuffer = await response.arrayBuffer();
    debugLog("DEBUG API: Received response from Python API");

    return new NextResponse(responseBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="highlighted.pdf"',
      },
    });
  } catch (error) {
    console.error("DEBUG API: Error processing PDF:", error);
    return NextResponse.json(
      { error: `Processing failed: ${error}` },
      { status: 500 }
    );
  }
}
