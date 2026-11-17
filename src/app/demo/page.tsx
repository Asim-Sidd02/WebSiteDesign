import type { Metadata } from "next";
import { Navbar, Footer } from "@/components";
import SpeechDemo from "@/components/speech-demo";

export const metadata: Metadata = {
  title: "Free Indian Sign Language Demo | SignSense",
  description:
    "Speak or type a phrase and explore SignSense’s Indian Sign Language avatar demo.",
};

export default function DemoPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="pt-16 sm:pt-20">
        <SpeechDemo />
      </main>
      <Footer />
    </>
  );
}
