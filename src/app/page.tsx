"use client";

import { Navbar, Footer } from "@/components";
import Hero from "./hero";
import Story from "./story";
import HowItWorks from "./how-it-works";
import AboutEvent from "./about-event";
import EventContent from "./event-content";
import Principles from "./principles";
import Faq from "./faq";
import BackToTop from "@/components/back-to-top";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Story />
        <HowItWorks />
        <AboutEvent />
        <EventContent />
        <Principles />
        <Faq />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
