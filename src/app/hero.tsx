"use client";

import { motion } from "framer-motion";
import LiveDemo from "@/components/live-demo";

const ease = [0.2, 0.7, 0.2, 1] as const;
const TEXT_TO_SIGN = "https://text2signs.netlify.app/";

function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
      {/* faint dot texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(13,13,18,0.07)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease }}
            className="label"
          >
            Sign language ⇄ text, in real time
          </motion.p>

          <h1 className="display mt-6 text-[13vw] sm:text-7xl lg:text-[5.4rem] xl:text-[6rem]">
            {["Talk with your hands.", "Be heard anyway."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  className={`block ${i === 1 ? "italic text-brand-500" : ""}`}
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.1 + i * 0.12, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease }}
          >
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink/65">
              SignSense reads your signing through the camera and turns it into text the other
              person can read. They type back, and it signs for you. No interpreter booking, no
              waiting.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#how"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-500"
              >
                Sign to text
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
              <a
                href={TEXT_TO_SIGN}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-ink/15 bg-white px-6 py-3.5 text-sm font-medium transition-colors hover:border-ink/40"
              >
                Text to sign ↗
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease }}
        >
          <LiveDemo />
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
