"use client";
import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/reveal";

const STEPS = [
  { title: "You sign", tag: "Camera", ms: 7000, body: "Sign in front of your camera, the way you normally would. Your words appear as text, and can be spoken aloud." },
  { title: "They reply", tag: "Avatar", ms: 11000, body: "The other person speaks or types. The avatar signs their reply in ISL." },
  { title: "Go at your pace", tag: "Player", ms: 14000, body: "Replay any sign, or slow it to half speed. Nothing moves on until you're ready." },
];

// Real signs from the avatar's library, played one at a time so the UI can follow along.
const SEQ: Record<number, { words: string[]; said?: string }> = {
  1: { words: ["thank you", "friend"], said: "Thank you, my friend!" },
  2: { words: ["hello", "good morning", "welcome"] },
};
const label = (w: string) => w.toUpperCase().replace(/ /g, "-");

/* ---------- avatar bridge (talks to /voice-demo via postMessage) ---------- */

function useAvatar(frameRef: React.RefObject<HTMLIFrameElement>) {
  const [ready, setReady] = React.useState(false);
  const [index, setIndex] = React.useState(-1); // which word in the sequence is playing; -1 idle
  const ctl = React.useRef({ words: [] as string[], i: -1, speed: 1, awaiting: false, triedText: false, timer: 0 as number | undefined });

  const post = React.useCallback((m: object) => {
    frameRef.current?.contentWindow?.postMessage(m, window.location.origin);
  }, [frameRef]);

  const playAt = React.useCallback((i: number) => {
    const c = ctl.current;
    c.i = i;
    c.awaiting = true;
    c.triedText = false;
    setIndex(i);
    post({ type: "signsense-play", word: c.words[i], speed: c.speed });
  }, [post]);

  const start = React.useCallback((words: string[], speed: number) => {
    const c = ctl.current;
    window.clearTimeout(c.timer);
    c.words = words;
    c.speed = speed;
    post({ type: "signsense-stop" });
    if (!words.length) { c.i = -1; setIndex(-1); return; }
    c.timer = window.setTimeout(() => playAt(0), 150);
  }, [post, playAt]);

  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frameRef.current?.contentWindow) return;
      if (e.data?.source !== "signsense-avatar") return;
      const c = ctl.current;
      if (e.data.type === "ready") setReady(true);
      if (e.data.type === "playing") c.awaiting = false;
      if (e.data.type === "error" && c.i >= 0 && !c.triedText) {
        // Fall back to the phrase planner if the dictionary key differs.
        c.triedText = true;
        post({ type: "signsense-play", text: c.words[c.i].replace(/-/g, " "), speed: c.speed });
        return;
      }
      if ((e.data.type === "ended" || e.data.type === "error") && !c.awaiting && c.i >= 0) {
        if (c.i < c.words.length - 1) {
          const next = c.i + 1;
          c.timer = window.setTimeout(() => playAt(next), 250);
        } else {
          c.i = -1;
          setIndex(c.words.length); // finished
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameRef, post, playAt]);

  // The avatar announces "ready" once; keep asking in case we missed it.
  React.useEffect(() => {
    if (ready) return;
    const id = window.setInterval(() => post({ type: "signsense-ping" }), 1000);
    return () => window.clearInterval(id);
  }, [ready, post]);

  return { ready, index, start };
}

/* ---------- step panels ---------- */

function CameraPanel() {
  const sentence = "Hello, how are you?";
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (n >= sentence.length) return;
    const t = setTimeout(() => setN(n + 1), n === 0 ? 1100 : 60);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <div className="grid h-full grid-rows-[1fr_auto] gap-3 p-3 sm:p-4">
      <div className="relative overflow-hidden rounded-2xl">
        <Image src="/image/isl-conversation-photo.png" alt="A Deaf signer in front of a camera" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        {["left-4 top-4 border-l-2 border-t-2", "right-4 top-4 border-r-2 border-t-2", "left-4 bottom-4 border-l-2 border-b-2", "right-4 bottom-4 border-r-2 border-b-2"].map((c) => (
          <span key={c} className={`absolute h-7 w-7 rounded-sm border-lotus-400 ${c}`} />
        ))}
        <div className="animate-scan absolute inset-x-6 h-px bg-gradient-to-r from-transparent via-lotus-400 to-transparent shadow-[0_0_18px_2px_rgba(216,188,138,0.6)]" />
        <span className="absolute left-4 top-14 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> REC
        </span>
        <span className="absolute right-4 top-14 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1fa463]" /> Hands in frame
        </span>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-xs font-bold">Aa</span>
        <p className="min-h-[28px] flex-1 font-serif text-lg font-semibold text-white sm:text-xl">
          {sentence.slice(0, n)}
          <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 animate-pulse bg-lotus-400" />
        </p>
        <span className="hidden rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70 sm:inline">Speak aloud</span>
      </div>
    </div>
  );
}

function Gloss({ words, index }: { words: string[]; index: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {words.map((w, i) => (
        <span key={w}
          className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider transition-all duration-300 ${
            i === index ? "bg-lotus-400 text-ink shadow-[0_0_20px_rgba(216,188,138,0.45)]" : i < index ? "bg-white/15 text-white/80" : "bg-white/5 text-white/35"
          }`}>
          {label(w)}
        </span>
      ))}
    </div>
  );
}

/* ---------- section ---------- */

export default function HowItWorks() {
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  React.useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const [speed, setSpeed] = React.useState(1);
  const [inView, setInView] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const { ready, index, start } = useAvatar(frameRef);

  // Only load the 3D avatar when the section gets near the screen.
  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { if (inView) setMounted(true); }, [inView]);

  // Auto-advance (paused on hover or while off screen).
  React.useEffect(() => {
    if (paused || !inView || reduceMotion) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEPS[active].ms);
    return () => clearTimeout(t);
  }, [active, paused, inView, reduceMotion]);

  const seq = SEQ[active]?.words ?? [];
  const play = React.useCallback((s = speed) => start(SEQ[active]?.words ?? [], s), [start, active, speed]);

  // Start the sign sequence whenever the step changes (or the avatar becomes ready).
  React.useEffect(() => {
    if (ready && inView) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, active, inView]);

  const changeSpeed = (s: number) => { setSpeed(s); play(s); };
  const showAvatar = active !== 0;

  return (
    <section ref={sectionRef} id="how" aria-labelledby="how-heading" className="relative overflow-hidden bg-ink text-white">
      {/* Editorial column rules instead of glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 mx-auto grid max-w-7xl grid-cols-4 px-5 sm:px-8 lg:grid-cols-12">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={`border-l border-white/[0.04] ${i >= 4 ? "hidden lg:block" : ""} ${i === 11 ? "border-r" : ""}`} />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="rule border-white/20 text-lotus-400">
          <span>How it works</span>
          <span className="text-white/40">02</span>
        </div>

        <div className="mt-8 grid items-end gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <h2 id="how-heading" className="display text-4xl sm:text-6xl">
              Three steps, in <span className="text-lotus-400">both</span> directions.
            </h2>
          </Reveal>
          <p className="text-lg leading-8 text-white/60 lg:col-span-5 lg:pb-2">
            Signs become text and speech. Speech becomes signs. Pick a step to see it in action.
          </p>
        </div>

        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10" onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setPaused(false)}
        >
          <div className="flex flex-col gap-6 lg:col-span-5">
          <ol className="relative flex flex-col">
            <span aria-hidden="true" className="absolute bottom-10 left-[39px] top-10 w-px bg-white/10" />
            {STEPS.map((s, i) => {
              const on = i === active;
              return (
                <li key={s.title} className="relative">
                  <button onClick={() => setActive(i)} aria-current={on}
                    className={`group relative flex w-full items-start gap-5 overflow-hidden rounded-2xl p-5 text-left transition-colors ${on ? "bg-white/[0.07] ring-1 ring-white/10" : "hover:bg-white/[0.03]"}`}>
                    <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full font-mono text-sm font-bold transition-all duration-300 ${
                      on ? "bg-white text-ink ring-4 ring-white/10" : "bg-ink text-white/50 ring-1 ring-white/15 group-hover:text-white"
                    }`}>
                      0{i + 1}
                    </span>
                    <div className="flex-1 pt-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className={`text-xl font-bold transition-colors ${on ? "text-white" : "text-white/60 group-hover:text-white/90"}`}>{s.title}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-opacity ${on ? "bg-white/10 text-white/70 opacity-100" : "opacity-0"}`}>{s.tag}</span>
                      </div>
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }} className="overflow-hidden text-base leading-7 text-white/65">
                            <span className="block pt-2">{s.body}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    {on && !reduceMotion && (
                      <motion.span key={`${active}-${paused}`} className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-lotus-400 to-lotus-500"
                        initial={{ width: "0%" }} animate={{ width: paused ? "0%" : "100%" }}
                        transition={{ duration: paused ? 0 : s.ms / 1000, ease: "linear" }} />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Fills the column so both sides end together */}
          <a href="/demo" className="group mt-auto flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-5 transition-colors hover:border-lotus-400/60 hover:bg-white/[0.03]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-lotus-400">Try it yourself</p>
              <p className="mt-1 text-lg font-bold">Type any phrase and watch it signed</p>
              <p className="mt-1 text-sm text-white/55">284 signs &middot; no sign-up &middot; works in your browser</p>
            </div>
            <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lotus-400 text-lg font-bold text-ink transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </a>
          </div>

          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[24px] bg-[#0f2a2d] shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_30px_70px_-25px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-white/15" />
                  <span className="h-3 w-3 rounded-full bg-white/15" />
                  <span className="h-3 w-3 rounded-full bg-white/15" />
                </div>
                <div className="mx-auto rounded-md bg-white/5 px-3 py-1 text-xs text-white/50">signsense.app / {STEPS[active].tag.toLowerCase()}</div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/60">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
                </span>
              </div>

              <div className="relative h-[460px]">
                {/* Step 1: real camera view */}
                <AnimatePresence>
                  {active === 0 && (
                    <motion.div key="cam" className="absolute inset-0 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                      <CameraPanel />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Steps 2 & 3: one persistent real avatar, so it never reloads between steps */}
                <div className={`absolute inset-0 grid gap-3 p-3 transition-opacity duration-300 sm:p-4 ${showAvatar ? "opacity-100" : "pointer-events-none opacity-0"} ${
                  active === 1 ? "grid-rows-[auto_1fr] sm:grid-cols-[0.85fr_1.15fr] sm:grid-rows-1" : "grid-rows-[1fr_auto]"
                }`}>
                  {active === 1 && (
                    <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">They said</p>
                        <div className="mt-3 flex h-10 items-center gap-[3px]">
                          {Array.from({ length: 26 }).map((_, i) => (
                            <motion.span key={i} className="w-[3px] rounded-full bg-brand-100/80"
                              animate={{ height: [6, 8 + ((i * 37) % 30), 6] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.04 }} />
                          ))}
                        </div>
                        <p className="mt-4 font-serif text-2xl font-semibold leading-tight">&ldquo;{SEQ[1].said}&rdquo;</p>
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">ISL word order</p>
                        <Gloss words={seq} index={index} />
                      </div>
                    </div>
                  )}

                  <div className={`relative min-h-0 overflow-hidden rounded-2xl bg-[#f2ebdd] ${active === 1 ? "order-first sm:order-none" : ""}`}>
                    {/* studio backdrop: wall, floor and a soft contact shadow */}
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[22%] bg-[#e6dcc8]" />
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-[22%] h-px bg-ink/10" />
                    <div aria-hidden="true" className="absolute bottom-[14%] left-1/2 h-6 w-48 -translate-x-1/2 rounded-[50%] bg-ink/15 blur-md" />
                    <span aria-hidden="true" className="absolute bottom-4 left-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/35">ISL &middot; Studio</span>
                    {mounted && (
                      <iframe
                        ref={frameRef}
                        src="/voice-demo/index.html?embed=1&transparent=1"
                        title="SignSense avatar signing the example phrase"
                        tabIndex={-1}
                        className="absolute inset-0 h-full w-full bg-transparent"
                        style={{ colorScheme: "normal" }}
                      />
                    )}
                    {!ready && (
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="flex items-center gap-2 text-sm font-bold text-ink/55">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/15 border-t-brand-500" /> Loading avatar&hellip;
                        </span>
                      </div>
                    )}
                    <AnimatePresence mode="wait">
                      {index >= 0 && index < seq.length && (
                        <motion.span key={`${active}-${index}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                          className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 font-mono text-xs font-bold text-white">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lotus-400" />
                          {label(seq[index])}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {active === 2 && (
                      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-ink px-3 py-1 font-mono text-xs font-bold text-white">{speed}&times;</span>
                    )}
                  </div>

                  {active === 2 && (
                    <div className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                      <div className="flex gap-1.5">
                        {seq.map((w, i) => (
                          <div key={w} className="flex-1">
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div className={`h-full bg-lotus-400 transition-all duration-500 ${i < index ? "w-full" : i === index ? "w-1/2 animate-pulse" : "w-0"}`} />
                            </div>
                            <span className={`mt-2 block font-mono text-[11px] font-bold tracking-wider ${i === index ? "text-lotus-400" : "text-white/40"}`}>{label(w)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button onClick={() => play()} disabled={!ready}
                          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/20 disabled:opacity-40">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
                          Replay
                        </button>
                        <div className="relative flex rounded-full bg-white/10 p-1" role="group" aria-label="Playback speed">
                          {[0.5, 1].map((s) => (
                            <button key={s} onClick={() => changeSpeed(s)} aria-pressed={speed === s} disabled={!ready}
                              className={`relative rounded-full px-4 py-1.5 font-mono text-sm font-bold transition-colors disabled:opacity-40 ${speed === s ? "text-ink" : "text-white/70 hover:text-white"}`}>
                              {speed === s && <motion.span layoutId="speed-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                              <span className="relative">{s}&times;</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
