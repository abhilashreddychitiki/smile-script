import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Load and configure Geist Sans font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Ensure text remains visible during font loading
});

// Load and configure Geist Mono font
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Ensure text remains visible during font loading
});

// Define metadata for SEO and browser tab
export const metadata: Metadata = {
  title: "SmileScript - AI Call Summarizer for Dental Clinics",
  description:
    "An AI-powered tool that summarizes dental clinic call transcripts",
  keywords: "dental, clinic, call, transcript, summarizer, AI, OpenAI",
  authors: [{ name: "SmileScript Team" }],
};

/**
 * Root layout component that wraps all pages
 *
 * This component provides the HTML structure and applies
 * global styles and fonts to all pages in the application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {children}
      </body>
    </html>
  );
}
