"use client";
import Reveal from "@/components/reveal";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const FAQS = [
  {
    q: "What can I try in the free demo?",
    a: "The included ISL vocabulary loads automatically, including short phrases such as “good morning” and “thank you”; you can browse every sign in the Sign dictionary. The demo arranges known signs in ISL word order and shows words without a sign as captions. It does not yet translate unrestricted ISL sentences. You can record or import additional clips in the demo setup.",
  },
  {
    q: "How does a two-way conversation work?",
    a: "The platform is designed to translate Indian Sign Language into text, and to convert typed text or spoken audio into ISL output through a 3D avatar.",
  },
  {
    q: "Can I use it on video calls?",
    a: "A meeting assistant is part of the platform vision. It is intended to join calls and provide live text from ISL signing; availability will depend on product rollout.",
  },
  {
    q: "Will it help at work?",
    a: "SignSense is being designed to support meeting participation with an ISL assistant that can share live text from signing.",
  },
  {
    q: "Does SignSense replace an interpreter?",
    a: "No. SignSense is for everyday conversations. For medical, legal, educational or other important situations, please use a qualified ISL interpreter.",
  },
  {
    q: "Which sign language does SignSense support?",
    a: "SignSense is focused solely on Indian Sign Language (ISL). It is not a general-purpose translator for other sign languages.",
  },
];

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-36">
      <div className="grid gap-10 sm:gap-16 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <p className="label">FAQ</p>
          <h2 className="display mt-5 text-4xl sm:text-5xl">
            Questions, answered plainly.
          </h2>
          <p className="mt-6 max-w-sm text-lg leading-8 text-ink/70">
            Something else on your mind?{" "}
            <a href="mailto:hello@signsense.app" className="text-ink underline underline-offset-4 hover:text-brand-500">
              Write to us
            </a>
            .
          </p>
        </Reveal>

        <Reveal delay={120} className="border-b border-ink/15">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="border-t border-ink/15">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-5 py-5 text-left sm:gap-6 sm:py-7"
                >
                  <span className="font-serif font-semibold tracking-tight text-xl leading-snug sm:text-2xl">{q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center text-2xl font-light text-ink/60"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl pb-7 text-base leading-8 text-ink/70 sm:text-lg">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

export default Faq;
