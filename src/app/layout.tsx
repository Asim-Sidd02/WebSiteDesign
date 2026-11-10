import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Layout } from "@/components";
import SmoothScroll from "@/components/smooth-scroll";

const sans = Inter({ subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "SignSense | Indian Sign Language, understood",
  description:
    "An Indian Sign Language platform for ISL-to-text, text and speech-to-sign with a 3D avatar, and live meeting support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={`${sans.className} ${mono.variable} bg-paper text-ink`}>
        <SmoothScroll />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
