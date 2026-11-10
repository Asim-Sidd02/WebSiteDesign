"use client";

import { ArrowRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const STATS = [
  ["Real-time", "Translation"],
  ["2-way", "Conversations"],
  ["Multi", "Language"],
];

function Hero() {
  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-brand-950">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-30"
        src="/image/video.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/70 via-brand-800/40 to-brand-950" />
      <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[30rem] w-[30rem] animate-glow rounded-full bg-brand-500/40 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[34rem] w-[34rem] animate-glow rounded-full bg-brand-700/50 blur-[140px] [animation-delay:3s]" />

      <div className="container relative z-10 mx-auto px-6 pt-24 text-center">
        <div className="animate-fade-up">
          <span className="eyebrow">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6b6bff]" />
            </span>
            Real-time sign language AI
          </span>
        </div>

        <h1 className="mx-auto mt-8 max-w-4xl animate-fade-up text-5xl font-extrabold leading-[1.05] tracking-tight text-white [animation-delay:150ms] sm:text-6xl lg:text-7xl">
          Your bridge to the world of{" "}
          <span className="text-gradient animate-shimmer">silent communication</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-white/60 [animation-delay:300ms]">
          SignSense translates sign language to text and text to sign: instantly,
          accurately, and accessibly for everyone.
        </p>

        <div className="mt-10 flex animate-fade-up flex-col items-center justify-center gap-4 [animation-delay:450ms] sm:flex-row">
          <a href="#" className="btn-primary group">
            Sign to Text
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a
            href="https://text2signs.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost group"
          >
            Text to Sign
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        <div className="mx-auto mt-20 grid max-w-3xl animate-fade-up grid-cols-3 gap-3 [animation-delay:600ms] sm:gap-4">
          {STATS.map(([a, b]) => (
            <div key={b} className="glass rounded-2xl px-3 py-5">
              <div className="text-lg font-bold text-white sm:text-2xl">{a}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-white/50 sm:text-xs">{b}</div>
            </div>
          ))}
        </div>
      </div>

      <a
        href="#features"
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/50 hover:text-white"
      >
        <ChevronDownIcon className="h-6 w-6" />
      </a>
    </section>
  );
}

export default Hero;
