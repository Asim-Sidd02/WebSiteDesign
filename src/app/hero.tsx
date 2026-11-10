"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const SignField = dynamic(() => import("@/components/sign-field"), { ssr: false });

const ease = [0.2, 0.7, 0.2, 1] as const;

function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-28">
      <div className="absolute inset-x-0 bottom-0 top-[30%] sm:top-[20%]">
        <SignField />
      </div>
      {/* fade the field into the page */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper via-paper/40 to-paper" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease }}
          className="label"
        >
          Sign language ⇄ text, in real time
        </motion.p>

        <h1 className="display mt-6 max-w-5xl text-[13vw] sm:text-[9vw] lg:text-[8.5rem]">
          {["Talk with your hands.", "Be heard anyway."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-2">
              <motion.span
                className={`block ${i === 1 ? "italic text-brand-500" : ""}`}
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.15 + i * 0.12, ease }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease }}
          className="mt-10 flex max-w-xl flex-col gap-8"
        >
          <p className="text-lg leading-relaxed text-ink/70">
            SignSense watches your signing through the camera and turns it into text the other
            person can read. They type back, and it signs for you. No interpreter booking, no
            waiting.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#"
              className="rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-500"
            >
              Sign to text
            </a>
            <a
              href="https://text2signs.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink/20 px-6 py-3.5 text-sm font-medium transition-colors hover:border-ink"
            >
              Text to sign ↗
            </a>
          </div>
        </motion.div>
      </div>

      <p className="label absolute bottom-6 right-5 hidden sm:right-8 sm:block">Move your cursor ↘</p>
    </section>
  );
}

export default Hero;
