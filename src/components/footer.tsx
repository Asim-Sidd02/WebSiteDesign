"use client";

import Image from "next/image";

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-brand-500/20 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-20 sm:px-8 sm:pt-28">
        <div className="max-w-4xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">SignSense · Indian Sign Language</p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Make every conversation <span className="text-[#8c8cff]">more accessible.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/60">
            An AI-powered communication platform focused solely on Indian Sign Language.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/demo" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#8c8cff] hover:text-white">
              Try the free demo
            </a>
            <a href="mailto:hello@signsense.app" className="rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold transition hover:border-white/60">
              Contact our team ↗
            </a>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-white/15 pt-7 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="flex items-center gap-3 text-white">
            <Image src="/image/signsense-mark.png" alt="" width={52} height={52} className="h-11 w-11 object-contain sm:h-[52px] sm:w-[52px]" />
            <span className="text-base font-semibold sm:text-lg">SignSense</span>
          </a>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-6">
            <a href="/#features" className="link-underline hover:text-white">Platform</a>
            <a href="/#how" className="link-underline hover:text-white">How it works</a>
            <a href="/#use-case" className="link-underline hover:text-white">Use cases</a>
            <a href="mailto:hello@signsense.app" className="link-underline hover:text-white">Contact</a>
          </nav>
          <p>© {CURRENT_YEAR} SignSense</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
