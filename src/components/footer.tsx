"use client";
import Reveal from "@/components/reveal";

import Image from "next/image";

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
            <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8 sm:pt-28">
        <Reveal className="max-w-4xl">
          <p className="label text-white/55">Get in touch</p>
          <h2 className="display mt-5 text-[2.6rem] sm:text-6xl">
            Every signer deserves to be understood.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
            Try the free demo today, or write to us. We especially want to hear from Deaf signers, families and interpreters.
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <a href="/demo" className="btn bg-white text-ink hover:bg-saffron-400">
              Try the free demo
            </a>
            <a href="mailto:hello@signsense.app" className="btn border border-white/40 text-white hover:border-white/70">
              Contact our team
            </a>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col gap-6 border-t sm:mt-20 border-white/15 pt-7 text-base text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="flex items-center gap-3 text-white">
            <Image src="/image/signsense-mark.png" alt="" width={52} height={52} className="h-11 w-11 object-contain sm:h-[52px] sm:w-[52px]" />
            <span className="font-serif font-semibold tracking-tight text-2xl">SignSense</span>
          </a>
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-6">
            <a href="/#features" className="link-underline hover:text-white">Platform</a>
            <a href="/#how" className="link-underline hover:text-white">How it works</a>
            <a href="/#use-case" className="link-underline hover:text-white">Use cases</a>
            <a href="/signs" className="link-underline hover:text-white">Sign dictionary</a>
            <a href="mailto:hello@signsense.app" className="link-underline hover:text-white">Contact</a>
          </nav>
          <p>© {CURRENT_YEAR} SignSense</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
