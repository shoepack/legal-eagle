"use client";

import { useState, useRef } from "react";

const DEBUG = true; // Set to false to disable debug logging

function debugLog(...args: unknown[]) {
  if (DEBUG) {
    console.log(...args);
  }
}

function debugError(...args: unknown[]) {
  if (DEBUG) {
    console.error(...args);
  }
}

interface SelectedFile {
  file: File;
  name: string;
  size: string;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Only PDF files are allowed";
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile({
      file,
      name: file.name,
      size: formatFileSize(file.size),
    });
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a PDF file");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile.file);

    try {
      debugLog("DEBUG: Starting file upload...");
      debugLog("DEBUG: Selected file:", selectedFile.name, selectedFile.size);
      debugLog("DEBUG: FormData contents:", formData.get("file"));

      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      });

      debugLog("DEBUG: Response status:", response.status);
      debugLog(
        "DEBUG: Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        debugLog("DEBUG: Response OK, processing blob...");
        const blob = await response.blob();
        debugLog("DEBUG: Blob size:", blob.size, "type:", blob.type);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `highlighted_${selectedFile.name}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        debugLog("DEBUG: Response not OK, trying to parse as JSON...");
        const responseText = await response.text();
        debugLog(
          "DEBUG: Raw response text:",
          responseText.substring(0, 200) + "..."
        );

        try {
          const errorData = JSON.parse(responseText);
          debugError("File upload failed:", response.status, errorData);
          setError(errorData.error || `Upload failed: ${response.status}`);
        } catch (parseError) {
          debugError("Failed to parse error response as JSON:", parseError);
          debugError("Raw response:", responseText.substring(0, 500));
          setError(
            `Upload failed: ${response.status} - Server returned non-JSON response`
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      debugError("Network error:", errorMessage);
      setError(`Network error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-heading font-bold text-navy mb-4">
            PDF Highlighter Dashboard
          </h1>
          <p className="text-lg text-slate-gray">
            Upload your legal invoices to automatically highlight Adjustments
            and Credit sections
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-slate-gray mb-2"
              >
                Select PDF File
              </label>

              {/* File Upload Area */}
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer ${
                  isDragOver
                    ? "border-teal bg-teal/10"
                    : selectedFile
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-teal"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <svg
                        className="mx-auto h-12 w-12 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-sm text-slate-gray">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-gray-500">{selectedFile.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSelectedFile();
                        }}
                        className="text-sm text-teal hover:text-teal/90 font-medium"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-slate-gray">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-teal hover:text-teal/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal">
                          Upload a file
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF files only, up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                id="file"
                name="file"
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={handleFileInputChange}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="bg-teal text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Highlight PDF"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              How it works:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Upload your legal invoice PDF (up to 10MB)</li>
              <li>
                • Our system automatically identifies Adjustments and Credit
                sections
              </li>
              <li>
                • Timekeeper names are color-coded for easy identification
              </li>
              <li>• Download your highlighted PDF instantly</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
