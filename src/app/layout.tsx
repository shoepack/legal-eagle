import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LegalUtils PDF Highlighter",
  description:
    "Automatically highlight Adjustments and Credit sections in legal invoices. Save time and improve accuracy with our intelligent PDF processing tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} antialiased`}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
