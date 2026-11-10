"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const ParticleHands = dynamic(() => import("@/components/particle-hands"), { ssr: false });
const LumenCta = dynamic(
  () => import("@designcodeio/threeui/components/LumenCta").then((m) => m.LumenCta),
  { ssr: false }
);

const ease = [0.2, 0.7, 0.2, 1] as const;
const TEXT_TO_SIGN = "https://text2signs.netlify.app/";

function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-28">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.3, ease }}
        className="absolute inset-0"
      >
        <ParticleHands />
      </motion.div>
      {/* keep the copy readable over the hands on small screens */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper via-paper/70 to-transparent lg:bg-gradient-to-r lg:from-paper lg:via-paper/60 lg:to-transparent" />

      <div className="pointer-events-none relative mx-auto max-w-7xl px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease }}
          className="label"
        >
          Sign language ⇄ text, in real time
        </motion.p>

        <h1 className="display mt-6 max-w-3xl text-[14vw] sm:text-[10vw] lg:text-[7.5rem]">
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
          className="pointer-events-auto mt-10 flex max-w-lg flex-col gap-8"
        >
          <p className="text-lg leading-relaxed text-ink/70">
            SignSense watches your signing through the camera and turns it into text the other
            person can read. They type back, and it signs for you. No interpreter booking, no
            waiting.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <LumenCta label="Sign to text" mode="light" hue={-12} className="!h-auto !w-auto !bg-transparent" onClick={() => (window.location.href = "#how")} />
            <a
              href={TEXT_TO_SIGN}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink/20 bg-paper/70 px-6 py-3.5 text-sm font-medium backdrop-blur transition-colors hover:border-ink"
            >
              Text to sign ↗
            </a>
          </div>
        </motion.div>
      </div>

      <p className="label absolute bottom-6 right-5 hidden sm:right-8 sm:block">Move your cursor through the hands ↗</p>
    </section>
  );
}

export default Hero;
