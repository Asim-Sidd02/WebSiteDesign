import "./globals.css";
import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { Layout } from "@/components";
import SmoothScroll from "@/components/smooth-scroll";

// Atkinson Hyperlegible was designed by the Braille Institute for maximum character distinction.
// Many Deaf readers use English as a second language after ISL, so legibility matters more than style here.
const sans = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-sans", display: "swap" });
// Bricolage Grotesque: a contemporary grotesque with warm, slightly irregular details, so headlines feel human rather than corporate.
const serif = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://signsense.app"),
  title: "AI for Indian Sign Language | SignSense",
  description:
    "SignSense is building an AI platform for Indian Sign Language: ISL to text and audio, speech and text to signed avatar output, and accessible meetings and seminars.",
  keywords: [
    "Indian Sign Language",
    "ISL translation",
    "ISL to text",
    "text to Indian Sign Language",
    "speech to sign language",
    "3D sign language avatar",
    "SignSense",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AI for Indian Sign Language | SignSense",
    description:
      "An AI platform for Indian Sign Language, with ISL-to-text and audio, signed avatar output, and accessible meetings and seminars.",
    siteName: "SignSense",
    type: "website",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "SignSense — AI-powered communication for Indian Sign Language",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI for Indian Sign Language | SignSense",
    description:
      "An AI platform for Indian Sign Language, with ISL-to-text and audio, signed avatar output, and accessible meetings and seminars.",
    images: ["/opengraph-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} ${mono.variable} bg-paper font-sans text-ink`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-white">
          Skip to content
        </a>
        <SmoothScroll />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
