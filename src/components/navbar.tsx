"use client";
import React from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

const NAV = [
  { name: "How it works", id: "how" },
  { name: "Features", id: "features" },
  { name: "Stories", id: "use-case" },
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

  const go = (id: string) => {
    setOpen(false);
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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <Image src="/image/signsense.png" alt="" width={32} height={32} />
          <span className="text-[15px] font-semibold tracking-tight">SignSense</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <li key={n.id}>
              <button onClick={() => go(n.id)} className="link-underline text-sm opacity-70 hover:opacity-100">
                {n.name}
              </button>
            </li>
          ))}
        </ul>

        <a
          href="https://text2signs.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden rounded-full px-5 py-2.5 text-sm font-medium transition-colors hover:bg-brand-500 hover:text-white md:inline-flex bg-ink text-white`}
        >
          Try it free
        </a>

        <button
          onClick={() => setOpen((v) => !v)}
          className="text-sm font-medium md:hidden"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-paper px-5 pb-6 text-ink md:hidden">
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.id}>
                <button onClick={() => go(n.id)} className="w-full border-b border-ink/10 py-4 text-left display text-3xl">
                  {n.name}
                </button>
              </li>
            ))}
          </ul>
          <a
            href="https://text2signs.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
          >
            Try it free
          </a>
        </div>
      )}
    </motion.header>
  );
}

export default Navbar;
