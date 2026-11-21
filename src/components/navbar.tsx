"use client";
import React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { scrollToTarget } from "./scroll-to";

const NAV: { name: string; id: string; href?: string }[] = [
  { name: "How it works", id: "how" },
  { name: "Features", id: "features" },
  { name: "Use cases", id: "use-case" },
  { name: "Sign dictionary", id: "signs", href: "/signs" },
  { name: "FAQ", id: "faq" },
];

export function Navbar() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const [hidden, setHidden] = React.useState(false);
  const [solid, setSolid] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<string | null>(null);

  // Scrollspy: highlight the section currently in the middle of the screen.
  React.useEffect(() => {
    const els = NAV.filter((n) => !n.href).map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    const onTop = () => window.scrollY < 300 && setActive(null);
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, []);

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
    // Let the mobile menu close (and body scroll unlock) before scrolling.
    window.setTimeout(() => scrollToTarget(id), open ? 60 : 0);
  };

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 ${open ? "bg-paper" : "px-3 pt-3 sm:px-5 sm:pt-4"}`}
    >
      <nav
        className={`relative mx-auto flex max-w-7xl items-center justify-between overflow-hidden rounded-2xl px-3 py-2 transition-all duration-300 sm:px-4 ${
          solid || open ? "bg-white/80 shadow-[0_8px_30px_-12px_rgba(12,31,34,0.25)] ring-1 ring-ink/[0.08] backdrop-blur-xl" : ""
        }`}
      >
        <a href="/" className="flex items-center gap-3">
          <Image src="/image/signsense-mark.png" alt="" width={50} height={50} className="h-10 w-10 object-contain sm:h-11 sm:w-11" />
          <span className="font-serif text-xl font-semibold tracking-tight">SignSense</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const on = active === n.id;
            return (
              <li key={n.id}>
                <button
                  onClick={() => go(n.id, n.href)}
                  aria-current={on ? "location" : undefined}
                  className={`relative whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-bold transition-colors ${on ? "text-ink" : "text-ink/60 hover:text-ink"}`}
                >
                  {on && (
                    <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-ink/[0.07]" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                  )}
                  <span className="relative">{n.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2.5">
        <a
          href="/demo"
          className="inline-flex h-11 items-center rounded-xl bg-ink px-5 text-sm font-bold text-white transition-colors hover:bg-brand-600 sm:text-[15px]"
        >
          Try free demo
        </a>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/15 text-ink transition hover:border-ink/25 lg:hidden"
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

        {/* Reading progress, shown once the bar is solid */}
        {solid && !open && (
          <motion.span aria-hidden="true" style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand-500/70" />
        )}
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
                    aria-current={active === n.id ? "location" : undefined}
                    className={`group flex w-full items-center gap-4 border-b border-ink/10 py-5 text-left ${active === n.id ? "text-brand-600" : ""}`}
                  >
                                        <span className="flex-1 font-serif font-semibold tracking-tight text-3xl">{n.name}</span>
                    <span aria-hidden="true" className="text-ink/30 transition group-hover:translate-x-1 group-hover:text-brand-500">→</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto pt-10">
              <a href="/demo" className="btn-primary w-full">
                Try the free demo <span aria-hidden="true">→</span>
              </a>
              <a href="mailto:hello@signsense.app" className="btn-secondary mt-3 w-full">
                Contact our team
              </a>
              <p className="mt-6 text-center text-sm text-ink/50">Made for Indian Sign Language</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;
