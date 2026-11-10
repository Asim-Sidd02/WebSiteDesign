"use client";

import { Navbar, Footer } from "@/components";
import Hero from "./hero";
import Story from "./story";
import HowItWorks from "./how-it-works";
import AboutEvent from "./about-event";
import EventContent from "./event-content";
import Faq from "./faq";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Story />
        <HowItWorks />
        <AboutEvent />
        <EventContent />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
