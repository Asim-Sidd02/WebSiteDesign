"use client";

import Image from "next/image";
import dynamic from "next/dynamic";

const LiquidFormBackground = dynamic(
  () => import("@designcodeio/threeui/components/LiquidFormBackground").then((m) => m.LiquidFormBackground),
  { ssr: false }
);

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#030304] text-white">
      <div className="absolute inset-0 lg:left-1/3">
        <LiquidFormBackground tintHue={238} tintAmount={0.55} mouseAmount={0.25} speed={0.8} className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#030304] via-[#030304]/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pt-40">
        <h2 className="display max-w-4xl text-6xl sm:text-8xl lg:text-[8.5rem]">
          Start the <span className="italic text-[#8c8cff]">conversation.</span>
        </h2>
        <p className="mt-8 max-w-md text-lg text-white/60">
          Free to try. Open it in your browser and start signing.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#" className="rounded-full bg-white px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-brand-500 hover:text-white">
            Sign to text
          </a>
          <a
            href="https://text2signs.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-medium backdrop-blur transition-colors hover:border-white"
          >
            Text to sign ↗
          </a>
        </div>

        <div className="mt-32 flex flex-col gap-6 border-t border-white/15 pt-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
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
          <p>
            © {CURRENT_YEAR} SignSense ·{" "}
            <a href="https://threeui.com" target="_blank" rel="noopener noreferrer" className="link-underline hover:text-white">
              Effects by ThreeUI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
