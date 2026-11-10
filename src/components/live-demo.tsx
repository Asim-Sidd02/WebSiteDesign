"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** 21-point hand landmark model (wrist, then thumb → pinky, base to tip). */
const P: [number, number][] = [
  [100, 222],
  [72, 202], [52, 178], [40, 154], [32, 132],
  [76, 142], [71, 104], [68, 79], [66, 56],
  [100, 136], [100, 95], [100, 67], [100, 42],
  [123, 141], [128, 103], [131, 78], [133, 57],
  [143, 152], [152, 124], [157, 104], [161, 86],
];
const BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

const SCRIPT = [
  { who: "you", text: "Hi, I have an appointment at 3." },
  { who: "them", text: "Welcome! Can I get your name?" },
  { who: "you", text: "Sara Ahmed. A-H-M-E-D." },
  { who: "them", text: "Thanks Sara, the doctor will see you shortly." },
];

function Hand() {
  return (
    <motion.svg
      viewBox="0 0 200 240"
      className="h-full w-full"
      animate={{ rotate: [-4, 3, -4], x: [-4, 4, -4] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {BONES.map(([a, b], i) => (
        <line
          key={i}
          x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]}
          stroke="#8C8CFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.8"
        />
      ))}
      {P.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={i % 4 === 0 ? 3.6 : 2.8}
          fill={i % 4 === 0 && i > 0 ? "#ffffff" : "#2F2FE4"}
          stroke="#ffffff"
          strokeWidth="1"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
    </motion.svg>
  );
}

export default function LiveDemo() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c >= SCRIPT.length ? 1 : c + 1)), 2600);
    return () => clearInterval(id);
  }, []);

  const shown = SCRIPT.slice(0, count);
  const signing = SCRIPT[count - 1]?.who === "you";

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_40px_80px_-30px_rgba(13,13,18,0.35)]">
        {/* window bar */}
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          </div>
          <span className="flex items-center gap-2 text-xs font-medium text-ink/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Product preview
          </span>
          <span className="font-mono text-[11px] text-ink/40">ISL → Text</span>
        </div>

        <div className="grid sm:grid-cols-[1fr_1.1fr]">
          {/* camera */}
          <div className="relative aspect-[4/5] bg-ink sm:aspect-auto">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#1A1953_0%,#0d0d12_70%)]" />
            <div className="absolute inset-6 rounded-lg border border-white/10" />
            <div className="absolute inset-x-8 bottom-10 top-8">
              <Hand />
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-white/50">
              <span>ISL translation concept</span>
              <span>{signing ? "signing…" : "watching"}</span>
            </div>
          </div>

          {/* transcript */}
          <div className="flex min-h-[320px] flex-col justify-end gap-2.5 bg-paper p-4">
            <AnimatePresence initial={false}>
              {shown.map((m, i) => (
                <motion.div
                  key={`${count > i ? i : "x"}-${m.text}`}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                    m.who === "you"
                      ? "self-start rounded-bl-md bg-brand-500 text-white"
                      : "self-end rounded-br-md border border-ink/10 bg-white text-ink"
                  }`}
                >
                  <span className={`mb-0.5 block text-[10px] font-medium uppercase tracking-wider ${m.who === "you" ? "text-white/60" : "text-ink/40"}`}>
                    {m.who === "you" ? "ISL · translated to text" : "Text · ready for sign output"}
                  </span>
                  {m.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* floating stat chip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute -bottom-8 -left-6 hidden rounded-xl border border-ink/10 bg-white px-4 py-3 shadow-lg sm:block"
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40">Delay</p>
        <p className="text-lg font-semibold tracking-tight">Real time</p>
      </motion.div>
    </div>
  );
}
