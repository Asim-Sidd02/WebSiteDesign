"use client";

import Image from "next/image";

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-brand-500 text-white">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pt-36">
        <h2 className="display max-w-5xl text-6xl sm:text-8xl lg:text-[9rem]">
          Start the <span className="italic">conversation.</span>
        </h2>
        <div className="mt-12 flex flex-wrap gap-3">
          <a href="#" className="rounded-full bg-white px-6 py-3.5 text-sm font-medium text-brand-500 transition-colors hover:bg-ink hover:text-white">
            Sign to text
          </a>
          <a
            href="https://text2signs.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/40 px-6 py-3.5 text-sm font-medium transition-colors hover:border-white"
          >
            Text to sign ↗
          </a>
        </div>

        <div className="mt-28 flex flex-col gap-6 border-t border-white/25 pt-8 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <Image src="/image/signsense.png" alt="" width={28} height={28} />
            <span className="font-semibold">SignSense</span>
          </div>
          <ul className="flex flex-wrap gap-6">
            {["About", "Team", "Blog", "Contact"].map((l) => (
              <li key={l}>
                <a href="#" className="link-underline hover:text-white">{l}</a>
              </li>
            ))}
          </ul>
          <p>© {CURRENT_YEAR} SignSense</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
