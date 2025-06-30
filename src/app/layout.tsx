import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
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
      <body
        className={`${openSans.variable} ${montserrat.variable} font-sans antialiased bg-slate-50`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
