"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/reveal";

// Commitments, in plain language.
const PRINCIPLES = [
  ["ISL first", "We build for Indian Sign Language only. Its grammar and word order matter; it is not signed English."],
  ["Honest about limits", "Our signs are early prototypes, not yet reviewed by Deaf ISL experts, and regional signs may differ."],
  ["Nothing depends on sound", "Everything is shown visually. Audio is always optional."],
  ["Support, not replacement", "SignSense is for everyday conversation. For medical, legal or other important matters, use a qualified interpreter."],
];


export default function Principles() {
  const [open, setOpen] = React.useState(0);

  return (
    <section aria-labelledby="promise-heading" className="overflow-hidden bg-sand">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="rule">
          <span>What we promise</span>
          <span className="text-ink/40">05</span>
        </div>
        <div className="mt-8 grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
          <Reveal className="lg:col-span-4">
            <h2 id="promise-heading" className="display text-4xl sm:text-6xl">
              Trust is <span className="italic text-brand-500">earned.</span>
            </h2>
            <p className="mt-5 max-w-sm text-lg leading-8 text-ink/70">Four commitments we hold ourselves to, written plainly.</p>
          </Reveal>

          <ul className="lg:col-span-8">
            {PRINCIPLES.map(([title, body], i) => {
              const on = open === i;
              return (
                <Reveal as="li" key={title} delay={i * 60} className="border-t border-ink/15 last:border-b">
                  <button
                    onClick={() => setOpen(i)}
                    onMouseEnter={() => setOpen(i)}
                    aria-expanded={on}
                    className="group flex w-full items-start gap-6 py-6 text-left sm:gap-10"
                  >
                    <span className={`font-mono text-sm font-bold transition-colors ${on ? "text-brand-500" : "text-ink/35"} pt-2`}>0{i + 1}</span>
                    <span className="flex-1">
                      <span className={`block font-serif text-2xl font-semibold tracking-tight transition-all duration-300 sm:text-4xl ${on ? "translate-x-2 text-ink" : "text-ink/45 group-hover:text-ink/70"}`}>
                        {title}
                      </span>
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.span
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                            className="block overflow-hidden"
                          >
                            <span className="block max-w-xl pt-3 pl-2 text-base leading-7 text-ink/70 sm:text-lg">{body}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span aria-hidden="true" className={`mt-2 grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-300 ${on ? "rotate-0 bg-ink text-white" : "-rotate-45 bg-ink/[0.06] text-ink/50"}`}>
                      &rarr;
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
