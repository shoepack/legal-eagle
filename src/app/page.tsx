"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function Home() {
  const [scroll, setScroll] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lastDotRef = useRef<HTMLDivElement>(null);
  const lastScroll = useRef(0);
  const [dotPositions, setDotPositions] = useState<number[]>([]);
  const timelineItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const timeline = timelineRef.current!;
      if (timeline) {
        const { top, height } = timeline.getBoundingClientRect();
        const newScroll = Math.max(
          0,
          Math.min(1, (window.innerHeight * 0.45 - top) / height)
        );
        setScroll(newScroll);

        if (newScroll >= 1 && lastScroll.current < 1) {
          const lastDot = lastDotRef.current;
          if (lastDot) {
            const { x, y } = lastDot.getBoundingClientRect();
            const origin = {
              x: (x + lastDot.offsetWidth / 2) / window.innerWidth,
              y: (y + lastDot.offsetHeight / 2) / window.innerHeight,
            };
            confetti({
              particleCount: 100,
              spread: 360,
              origin,
            });
          }
        }
        lastScroll.current = newScroll;
      }
    };

    const calculateDotPositions = () => {
      const timeline = timelineRef.current;
      if (timeline) {
        const timelineHeight = timeline.offsetHeight;
        const positions = timelineItemRefs.current
          .map((ref) => {
            if (ref) {
              const dotTop = ref.offsetTop + ref.offsetHeight / 2;
              return dotTop / timelineHeight;
            }
            return 0;
          })
          .filter((pos) => pos > 0);
        setDotPositions(positions);
      }
    };

    calculateDotPositions();
    window.addEventListener("resize", calculateDotPositions);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", calculateDotPositions);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>
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
        <div className="flex space-x-4">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white px-8 py-4 rounded-lg text-base font-semibold tracking-wider shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            Book a Demo
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-white via-[#F6F6F6] to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-navy mb-4">
              A Better Workflow, A Better Firm
            </h2>
            <p className="text-lg text-slate-gray">
              Our features are designed to help you work smarter, not harder.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <h3 className="text-xl font-semibold text-navy mb-2">
                Streamlined Document Review
              </h3>
              <p className="text-slate-gray">
                Rapidly identifies & marks crucial sections in legal PDFs for
                timekeepers to review, saving significant time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <h3 className="text-xl font-semibold text-navy mb-2">
                User-Friendly Experience
              </h3>
              <p className="text-slate-gray">
                Easily transform complex legal PDFs into clearly highlighted
                documents for quick understanding.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <h3 className="text-xl font-semibold text-navy mb-2">
                Strict Data Privacy
              </h3>
              <p className="text-slate-gray">
                Your data privacy is paramount. Information is stored only
                temporarily during processing and is not retained.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative py-16 bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
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
            <div
              className="timeline-item"
              ref={(el) => {
                timelineItemRefs.current[0] = el;
              }}
            >
              <div
                className={`timeline-dot ${
                  scroll >= (dotPositions[0] || 0) ? "reached" : ""
                }`}
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
            <div
              className="timeline-item"
              ref={(el) => {
                timelineItemRefs.current[1] = el;
              }}
            >
              <div
                className={`timeline-dot ${
                  scroll >= (dotPositions[1] || 0) ? "reached" : ""
                }`}
              ></div>
              <div className="timeline-content">
                <h3 className="text-xl font-semibold text-navy mb-2">
                  2. We Analyze Your Data
                </h3>
                <p className="text-slate-gray">
                  Our custom tools immediately get to work, extracting and
                  analyzing key information.
                </p>
              </div>
            </div>
            <div
              className="timeline-item"
              ref={(el) => {
                timelineItemRefs.current[2] = el;
              }}
            >
              <div
                ref={lastDotRef}
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
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-b from-white via-[#F6F6F6] to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Absolutely. We take great care in protecting your data, storing
                it only temporarily during processing.
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-navy mb-2">
                What types of documents can I upload?
              </h3>
              <p className="text-slate-gray">
                PDFs are currently supported. Let us know if you need to upload
                other formats.
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-navy mb-2">
                How long are my documents stored?
              </h3>
              <p className="text-slate-gray">
                Your data privacy is important. Uploaded files are encrypted in
                transit (using HTTPS) and are only held in our system&apos;s
                memory during the highlighting process. We do not store your
                documents on our servers after processing is complete.
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-navy mb-2">
                Are there file size or page-count limits?
              </h3>
              <p className="text-slate-gray">
                We currently support PDFs up to 10 MB. While there&apos;s no
                strict page limit, exceptionally large documents may not be
                processed successfully. If you encounter issues, we recommend
                splitting the document into smaller parts.
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-navy mb-2">
                How long does document processing take?
              </h3>
              <p className="text-slate-gray">
                Processing time is typically under two minutes. The
                &quot;Highlight PDF&quot; button will show a
                &quot;Processing...&quot; state, and your download will begin
                automatically once the new file is ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
