"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const ease = [0.2, 0.7, 0.2, 1] as const;

function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-36">
      <div className="pointer-events-none absolute -right-32 top-12 h-[34rem] w-[34rem] rounded-full bg-brand-500/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="label inline-flex items-center gap-2 rounded-full border border-brand-500/15 bg-white/70 px-3.5 py-2 text-brand-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Indian Sign Language, both ways
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease }}
            className="mt-7 max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[4.5rem]"
          >
            Indian Sign Language. <span className="text-brand-500">Understood.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease }}
          >
            <p className="mt-7 max-w-xl text-lg leading-8 text-ink/65">
              SignSense is building an AI platform for Indian Sign Language. Translate ISL into text
              and audio, and turn spoken or written messages into signs with a 3D avatar.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="/demo"
                className="group inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-ink/10 transition hover:-translate-y-0.5 hover:bg-brand-500"
              >
                Try the free demo <span aria-hidden="true">→</span>
              </a>
              <a
                href="#use-case"
                className="inline-flex items-center rounded-lg border border-ink/15 bg-white/70 px-5 py-3.5 text-sm font-semibold transition hover:border-ink/30 hover:bg-white"
              >
                Explore use cases
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink/50">
              <span>ISL-first</span>
              <span>Text and audio</span>
              <span>Designed for live conversations</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.12, ease }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-500/15 via-transparent to-[#8c8cff]/20 blur-xl" />
          <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white p-2 shadow-[0_35px_90px_-40px_rgba(13,13,18,0.35)] sm:p-3">
            <Image
              src="/image/isl-conversation-photo.png"
              alt="A Deaf Indian woman using Indian Sign Language during a video conversation at home"
              width={1672}
              height={928}
              priority
              className="aspect-[1.2/1] w-full rounded-xl object-cover object-[62%_center] sm:aspect-[1.22/1]"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-xl border border-white/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:bottom-8 sm:left-8">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-base font-semibold text-brand-600" aria-hidden="true">↔</span>
              <span>
                <span className="block text-xs font-semibold text-ink">Communication, both ways</span>
                <span className="mt-0.5 block text-[11px] text-ink/55">ISL · text · audio · avatar</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
