"use client"; // components
import { Navbar, Footer } from "@/components";

// sections
import Hero from "./hero";

import AboutEvent from "./about-event";

import EventContent from "./event-content";
import Faq from "./faq";

export default function Portfolio() {
  return (
    <>
    <title>SignSense</title>
      <Navbar />
      <Hero />
     
      <AboutEvent />
    
      <EventContent />
      <Faq />
      <Footer />
    </>
  );
}
