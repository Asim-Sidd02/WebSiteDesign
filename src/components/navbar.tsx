"use client";
import React from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

const NAV: { name: string; id: string; href?: string }[] = [
  { name: "How it works", id: "how" },
  { name: "Features", id: "features" },
  { name: "Use cases", id: "use-case" },
  { name: "Sign dictionary", id: "signs", href: "/signs" },
  { name: "FAQ", id: "faq" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = React.useState(false);
  const [solid, setSolid] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200 && !open);
    setSolid(y > 24);
  });

  const go = (id: string, href?: string) => {
    setOpen(false);
    if (href) {
      window.location.assign(href);
      return;
    }
    if (window.location.pathname !== "/") {
      window.location.assign(`/#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "border-b border-ink/10 bg-paper/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 sm:py-4">
        <a href="/" className="flex items-center gap-3">
          <Image src="/image/signsense-mark.png" alt="" width={50} height={50} className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
          <span className="text-[15px] font-semibold tracking-tight sm:text-lg">SignSense</span>
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <li key={n.id}>
              <button onClick={() => go(n.id, n.href)} className="link-underline whitespace-nowrap text-[15px] opacity-75 hover:opacity-100 lg:text-base">
                {n.name}
              </button>
            </li>
          ))}
        </ul>

        <a
          href="/demo"
          className="inline-flex rounded-full bg-ink px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-500 hover:text-white sm:px-5 sm:py-3 sm:text-[15px]"
        >
          Free demo
        </a>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 bg-white/70 text-ink transition hover:border-ink/25 lg:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? (
              <>
                <path d="M6 6l12 12M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16M4 12h16M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-navigation" className="border-t border-ink/10 bg-paper px-5 pb-6 text-ink lg:hidden">
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.id}>
                <button onClick={() => go(n.id, n.href)} className="w-full border-b border-ink/10 py-4 text-left text-[17px] font-medium tracking-tight">
                  {n.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.header>
  );
}

export default Navbar;
