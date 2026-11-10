"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Indian Sign Language to text",
    body: "Camera-based ISL recognition is designed to turn signing into readable text and audio for the people around you.",
  },
  {
    title: "Text and speech to ISL",
    body: "Typed text and spoken audio can be converted into Indian Sign Language, presented by a 3D avatar. ISL output can also be shared as text or audio.",
  },
  {
    title: "An assistant for meetings",
    body: "A meeting bot is planned to join online calls, recognize ISL signing and share live text so participants can follow along.",
  },
];

export function AboutEvent() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="label">The platform</p>
          <h2 className="display mt-6 text-5xl sm:text-7xl">
            Designed around
            <br />
            <span className="text-brand-500">Indian Sign Language.</span>
          </h2>
        </div>

        <ul>
          {FEATURES.map((f, i) => (
            <motion.li
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
              className="group grid grid-cols-[auto_1fr] gap-6 border-t border-ink/15 py-10 last:border-b sm:gap-10"
            >
              <span className="font-mono text-sm text-ink/40 transition-colors group-hover:text-brand-500">
                0{i + 1}
              </span>
              <div>
                <h3 className="text-2xl font-medium tracking-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-3xl">
                  {f.title}
                </h3>
                <p className="mt-3 max-w-lg leading-relaxed text-ink/60">{f.body}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default AboutEvent;
