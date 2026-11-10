import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Layout } from "@/components";
import SmoothScroll from "@/components/smooth-scroll";

const sans = Inter({ subsets: ["latin"], display: "swap" });
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
      <body className={`${sans.className} ${mono.variable} bg-paper text-ink`}>
        <SmoothScroll />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
