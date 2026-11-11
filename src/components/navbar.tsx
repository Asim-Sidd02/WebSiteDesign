"use client";
import React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";

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

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

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
        open ? "border-b border-ink/10 bg-paper" : solid ? "border-b border-ink/10 bg-paper/85 backdrop-blur-md" : "bg-transparent"
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

        <div className="flex items-center gap-2.5">
        <a
          href="/demo"
          className="inline-flex h-11 items-center rounded-full bg-ink px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-500 hover:text-white sm:h-auto sm:px-5 sm:py-3 sm:text-[15px]"
        >
          Free demo
        </a>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 bg-white/70 text-ink transition hover:border-ink/25 lg:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
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
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-paper px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 text-ink sm:h-[calc(100dvh-5rem)] sm:px-8 lg:hidden"
          >
            <ul className="flex flex-col">
              {NAV.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 * i, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  <button
                    onClick={() => go(n.id, n.href)}
                    className="group flex w-full items-center gap-4 border-b border-ink/10 py-5 text-left"
                  >
                    <span className="font-mono text-xs text-ink/35">0{i + 1}</span>
                    <span className="flex-1 text-2xl font-semibold tracking-[-0.035em]">{n.name}</span>
                    <span aria-hidden="true" className="text-ink/30 transition group-hover:translate-x-1 group-hover:text-brand-500">→</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto pt-10">
              <a href="/demo" className="flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-4 text-sm font-semibold text-white">
                Try the free demo <span aria-hidden="true">→</span>
              </a>
              <a href="mailto:hello@signsense.app" className="mt-3 flex items-center justify-center rounded-xl border border-ink/15 px-5 py-4 text-sm font-semibold">
                Contact our team
              </a>
              <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink/40">Indian Sign Language · both ways</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;
