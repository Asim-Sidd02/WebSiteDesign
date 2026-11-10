"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const FAQS = [
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
    q: "Which sign language does SignSense support?",
    a: "SignSense is focused solely on Indian Sign Language (ISL). It is not a general-purpose translator for other sign languages.",
  },
];

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="label">Questions</p>
          <h2 className="display mt-6 text-5xl sm:text-7xl">
            Good <span className="italic text-brand-500">questions.</span>
          </h2>
          <p className="mt-6 max-w-sm text-ink/60">
            Something else on your mind?{" "}
            <a href="mailto:hello@signsense.app" className="text-ink underline underline-offset-4 hover:text-brand-500">
              Write to us
            </a>
            .
          </p>
        </div>

        <div className="border-b border-ink/15">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="border-t border-ink/15">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-7 text-left"
                >
                  <span className="text-xl font-medium tracking-tight sm:text-2xl">{q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-light text-brand-500"
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
                      <p className="max-w-xl pb-8 leading-relaxed text-ink/60">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Faq;
