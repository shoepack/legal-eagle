"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [scroll, setScroll] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const timeline = timelineRef.current!;
      if (timeline) {
        const { top, height } = timeline.getBoundingClientRect();
        const newScroll = Math.max(
          0,
          Math.min(1, (window.innerHeight * 0.3 - top) / height)
        );
        setScroll(newScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-left">
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-navy mb-6">
          Modern Legal Software
          <span className="block text-teal">for Modern Law Firms</span>
        </h1>
        <p className="text-xl text-slate-gray mb-8 max-w-3xl">
          Our powerful, intuitive legal tech solutions are designed to
          streamline your workflow, saving you time and money.
        </p>
        <div className="space-x-4">
          <Link
            href="/dashboard"
            className="bg-teal text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Book a Demo
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading font-bold text-navy mb-4">
            A Better Workflow, A Better Firm
          </h2>
          <p className="text-lg text-slate-gray">
            Our features are designed to help you work smarter, not harder.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-navy mb-2">
              Intelligent Document Processing
            </h3>
            <p className="text-slate-gray">
              Our AI-powered tools automatically extract and analyze key data
              from your legal documents.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-navy mb-2">
              Seamless Collaboration
            </h3>
            <p className="text-slate-gray">
              Share and collaborate on documents with your team in real-time,
              from anywhere.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-navy mb-2">
              Bank-Grade Security
            </h3>
            <p className="text-slate-gray">
              Your data is protected with the same level of security as a bank,
              so you can work with confidence.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-navy mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-gray">
              Get started in just a few simple steps.
            </p>
          </div>
          <div className="timeline" ref={timelineRef}>
            <div
              className="timeline-progress"
              style={{ height: `${scroll * 100}%` }}
            ></div>
            <div className="timeline-item">
              <div
                className={`timeline-dot ${scroll >= 0.33 ? "reached" : ""}`}
              ></div>
              <div className="timeline-content">
                <h3 className="text-xl font-semibold text-navy mb-2">
                  1. Upload Your Documents
                </h3>
                <p className="text-slate-gray">
                  Drag and drop your legal documents into our secure portal.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div
                className={`timeline-dot ${scroll >= 0.66 ? "reached" : ""}`}
              ></div>
              <div className="timeline-content">
                <h3 className="text-xl font-semibold text-navy mb-2">
                  2. We Analyze Your Data
                </h3>
                <p className="text-slate-gray">
                  Our AI-powered tools get to work, extracting and analyzing key
                  information.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div
                className={`timeline-dot ${scroll >= 1 ? "reached" : ""}`}
              ></div>
              <div className="timeline-content">
                <h3 className="text-xl font-semibold text-navy mb-2">
                  3. Get Actionable Insights
                </h3>
                <p className="text-slate-gray">
                  Receive a detailed report with actionable insights in minutes.
                </p>
              </div>
            </div>
            <div
              className="timeline-item"
              style={{ opacity: scroll >= 1 ? 1 : 0 }}
            >
              <div className="timeline-dot reached">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.454-12.68a.75.75 0 011.04-.208z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading font-bold text-navy mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-navy mb-2">
              Is my data secure?
            </h3>
            <p className="text-slate-gray">
              Yes, we use bank-grade encryption to protect your data.
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-navy mb-2">
              What types of documents can I upload?
            </h3>
            <p className="text-slate-gray">
              We support a wide range of document types, including PDFs, Word
              documents, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 LegalUtils. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Link href="#" className="hover:text-teal">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-teal">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-teal">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
