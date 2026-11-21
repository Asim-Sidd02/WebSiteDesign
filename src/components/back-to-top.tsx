"use client";
import React from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { scrollToTarget } from "./scroll-to";

/** Appears after the first screen; a ring around it shows how far down the page you are. */
export function BackToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const [show, setShow] = React.useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > window.innerHeight * 1.2));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            scrollToTarget(0);
            document.getElementById("main")?.focus({ preventScroll: true });
          }}
          aria-label="Back to top"
          className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-white text-ink shadow-[0_10px_30px_-10px_rgba(12,31,34,0.35)] ring-1 ring-ink/10 transition-colors hover:bg-ink hover:text-white sm:bottom-8 sm:right-8"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
            <motion.circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" style={{ pathLength: scrollYProgress }} />
          </svg>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="relative h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default BackToTop;
