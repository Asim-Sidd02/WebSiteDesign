"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const LiquidFormBackground = dynamic(
  () => import("@designcodeio/threeui/components/LiquidFormBackground").then((m) => m.LiquidFormBackground),
  { ssr: false }
);
const LumenCta = dynamic(
  () => import("@designcodeio/threeui/components/LumenCta").then((m) => m.LumenCta),
  { ssr: false }
);

const ease = [0.2, 0.7, 0.2, 1] as const;
const TEXT_TO_SIGN = "https://text2signs.netlify.app/";

function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#030304] pt-28 text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.2, ease }}
        className="absolute inset-0 lg:left-[30%]"
      >
        <LiquidFormBackground tintHue={238} tintAmount={0.55} mouseAmount={0.25} speed={0.8} className="h-full w-full" />
      </motion.div>
      {/* keep the copy readable over the liquid form */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#030304]/80 via-[#030304]/40 to-[#030304] lg:bg-gradient-to-r lg:from-[#030304] lg:via-[#030304]/60 lg:to-transparent" />

      <div className="pointer-events-none relative mx-auto max-w-7xl px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease }}
          className="label !text-white/50"
        >
          Sign language ⇄ text, in real time
        </motion.p>

        <h1 className="display mt-6 max-w-3xl text-[14vw] sm:text-[10vw] lg:text-[7.5rem]">
          {["Talk with your hands.", "Be heard anyway."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-2">
              <motion.span
                className={`block ${i === 1 ? "italic text-[#8c8cff]" : ""}`}
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
          <p className="text-lg leading-relaxed text-white/70">
            SignSense watches your signing through the camera and turns it into text the other
            person can read. They type back, and it signs for you. No interpreter booking, no
            waiting.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <LumenCta label="Sign to text" mode="dark" hue={-12} className="!h-auto !w-auto !bg-transparent" onClick={() => (window.location.href = "#how")} />
            <a
              href={TEXT_TO_SIGN}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-medium backdrop-blur transition-colors hover:border-white"
            >
              Text to sign ↗
            </a>
          </div>
        </motion.div>
      </div>

      <p className="label absolute bottom-6 right-5 hidden !text-white/40 sm:right-8 sm:block">Move your cursor ↗</p>
    </section>
  );
}

export default Hero;
