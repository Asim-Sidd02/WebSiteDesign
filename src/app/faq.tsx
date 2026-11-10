"use client";

import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Reveal } from "@/components/reveal";

const FAQS = [
  {
    title: "How do I use SignSense for two-way conversations?",
    desc: "SignSense allows both parties to communicate naturally in their respective languages. The app translates the conversation in real-time, ensuring clear communication.",
  },
  {
    title: "Can I use SignSense with video conferencing?",
    desc: "Yes! SignSense facilitates seamless communication during video conferences, even when participants communicate in different languages.",
  },
  {
    title: "How can SignSense help me with my career?",
    desc: "By breaking down language barriers, SignSense opens doors to global opportunities. You can attend conferences, collaborate with international clients, or even interview for jobs overseas.",
  },
  {
    title: "What languages does SignSense support?",
    desc: "SignSense offers comprehensive multilingual support, translating to and from a wide range of languages, including English, Spanish and Mandarin, as well as less common languages.",
  },
];

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-white px-6 py-28">
      <div className="container mx-auto">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Everything you need to know to unlock seamless communication with SignSense.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 flex max-w-3xl flex-col gap-4">
          {FAQS.map(({ title, desc }, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 80}>
                <div
                  className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    isOpen
                      ? "border-brand-500/40 shadow-[0_16px_40px_-20px_rgba(47,47,228,0.45)]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-gray-900">{title}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen ? "rotate-45 border-brand-500 bg-brand-500" : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <PlusIcon className={`h-4 w-4 ${isOpen ? "text-white" : "text-gray-700"}`} />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-500 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <p className="px-6 pb-6 leading-relaxed text-gray-600">{desc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mx-auto mt-28 max-w-5xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 via-brand-700 to-brand-800 p-10 text-center sm:p-16">
            <div className="grid-bg absolute inset-0 opacity-40" />
            <div className="absolute -right-20 -top-20 h-64 w-64 animate-float rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Start communicating without barriers
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-white/75">
                Try SignSense today and experience real-time sign language translation.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-800 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Sign to Text
                </a>
                <a
                  href="https://text2signs.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost justify-center"
                >
                  Text to Sign
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Faq;
