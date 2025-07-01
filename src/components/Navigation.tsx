"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <nav
      className={`fixed w-full z-10 transition-colors duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-navy">
              LegalUtils
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={`${
                pathname === "/" ? "text-teal" : "text-slate-gray"
              } hover:text-teal px-3 py-2 text-sm font-medium`}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className={`${
                pathname === "/pricing" ? "text-teal" : "text-slate-gray"
              } hover:text-teal px-3 py-2 text-sm font-medium`}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className={`${
                pathname === "/login" ? "text-teal" : "text-slate-gray"
              } hover:text-teal px-3 py-2 text-sm font-medium`}
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
