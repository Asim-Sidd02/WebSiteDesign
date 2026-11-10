import "./globals.css";
import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Layout } from "@/components";
import SmoothScroll from "@/components/smooth-scroll";

const sans = Inter({ subsets: ["latin"], display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "SignSense | Sign language, understood",
  description:
    "SignSense translates sign language to text and text to sign in real time, so Deaf and hearing people can talk without waiting for an interpreter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={`${sans.className} ${serif.variable} ${mono.variable} bg-paper text-ink`}>
        <SmoothScroll />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
