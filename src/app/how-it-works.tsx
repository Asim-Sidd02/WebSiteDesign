"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const ConstellationField = dynamic(
  () => import("@designcodeio/threeui/components/ConstellationField").then((m) => m.ConstellationField),
  { ssr: false }
);

const STEPS = [
  {
    n: "01",
    title: "Sign naturally",
    body: "Open SignSense and sign in front of your camera, at your own pace. No special gloves, no slowing down.",
  },
  {
    n: "02",
    title: "They read along",
    body: "Your signs appear as text on their screen as you go, so they can follow the conversation as it happens.",
  },
  {
    n: "03",
    title: "They reply, you watch",
    body: "Whatever they type comes back to you as sign, so neither of you has to switch language.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <ConstellationField variant="particle-network" mode="dark" hue={-20} opacity={0.8} className="h-full w-full" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="display text-5xl sm:text-7xl">
            How it <span className="italic text-[#8c8cff]">works</span>
          </h2>
          <p className="max-w-sm text-white/60">
            Three steps, both directions, and nobody has to learn anything first.
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
              className="group bg-ink/85 p-8 backdrop-blur-sm transition-colors duration-500 hover:bg-brand-800 sm:p-10"
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
