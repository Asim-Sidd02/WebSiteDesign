"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Sign in ISL",
    body: "Use your camera to capture Indian Sign Language. SignSense is designed to interpret the signing and present it as readable text.",
  },
  {
    n: "02",
    title: "Speak or type back",
    body: "A hearing participant can type or speak. SignSense turns that message into ISL output through a 3D signing avatar.",
  },
  {
    n: "03",
    title: "Keep everyone included",
    body: "For online meetings, an ISL assistant can join the conversation and help convert signing into live text for other participants.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-brand-500/20 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="display text-5xl sm:text-7xl">
            How it <span className="text-[#8c8cff]">works</span>
          </h2>
          <p className="max-w-sm text-white/60">
            One ISL-first experience for conversations, audio and online meetings.
          </p>
        </div>

        <div className="mt-20 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.2, 0.7, 0.2, 1] }}
              className="group bg-ink p-8 transition-colors duration-500 hover:bg-brand-800 sm:p-10"
            >
              <span className="font-mono text-sm text-white/40">{s.n}</span>
              <h3 className="display mt-16 text-4xl">{s.title}</h3>
              <p className="mt-4 leading-relaxed text-white/60">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
