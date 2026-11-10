"use client";

import { BoltIcon, ArrowsRightLeftIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import AboutCard from "@/components/about-card";
import { Reveal } from "@/components/reveal";

const FEATURES = [
  {
    icon: BoltIcon,
    title: "Real-Time Translation",
    description:
      "Translate content as it happens. Hold conversations, presentations and collaborations without waiting on manual translation or an external interpreter. SignSense works instantly and accurately.",
  },
  {
    icon: ArrowsRightLeftIcon,
    title: "Two-Way Translation",
    description:
      "Talk naturally in both directions. SignSense translates between you in real-time, face-to-face, on the phone, or over video calls, removing the need for an interpreter.",
  },
  {
    icon: GlobeAltIcon,
    title: "Multilingual Support",
    description:
      "From English, Spanish and Mandarin to less common languages, SignSense breaks down barriers so you can collaborate globally and understand each other across cultures.",
  },
];

export function AboutEvent() {
  return (
    <section id="features" className="relative overflow-hidden bg-white px-6 py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
      <div className="container mx-auto">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Features</span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Why <span className="text-gradient">SignSense</span>?
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            SignSense translates sign language to spoken language in real-time, enhancing
            communication accessibility for the deaf and hard of hearing.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 120} className="h-full">
              <AboutCard {...f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutEvent;
