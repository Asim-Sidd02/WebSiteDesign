import type { Metadata } from "next";
import { Navbar, Footer } from "@/components";
import SignDictionary from "@/components/sign-dictionary";

export const metadata: Metadata = {
  title: "Indian Sign Language Dictionary | SignSense",
  description:
    "Search Indian Sign Language (ISL) words and watch a 3D avatar sign each one. Free, with no sign-up.",
  alternates: { canonical: "/signs" },
  openGraph: {
    title: "Indian Sign Language Dictionary | SignSense",
    description: "Search ISL words and watch a 3D avatar sign each one.",
    url: "/signs",
    images: ["/opengraph-image.jpg"],
  },
};

export default function SignsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="pt-16 sm:pt-20">
        <SignDictionary />
      </main>
      <Footer />
    </>
  );
}
