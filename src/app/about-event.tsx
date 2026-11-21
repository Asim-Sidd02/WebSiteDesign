"use client";
import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/reveal";
import SpotlightCard from "@/components/spotlight-card";

// Each feature carries an honest status, so nobody plans around something that isn't ready yet.
function Status({ live, dark, children }: { live?: boolean; dark?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        live ? (dark ? "bg-[#1fa463]/20 text-[#7ee2ad]" : "bg-[#e3f6ec] text-[#13693f]") : "bg-ink/[0.06] text-ink/60"
      }`}
    >
      <span className={`relative h-1.5 w-1.5 rounded-full ${live ? "bg-[#1fa463]" : "bg-ink/35"}`}>
        {live && <span className="absolute inset-0 animate-ping rounded-full bg-[#1fa463]" />}
      </span>
      {children}
    </span>
  );
}

const PHRASES = ["good morning", "thank you", "where is the station", "nice to meet you"];

/** Types phrases and shows each word as a "sign" chip, the way the demo arranges them. */
function TypingDemo() {
  const [idx, setIdx] = React.useState(0);
  const [typed, setTyped] = React.useState("");
  const phrase = PHRASES[idx];

  React.useEffect(() => {
    if (typed.length < phrase.length) {
      const t = setTimeout(() => setTyped(phrase.slice(0, typed.length + 1)), 70);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setTyped("");
      setIdx((i) => (i + 1) % PHRASES.length);
    }, 2600);
    return () => clearTimeout(t);
  }, [typed, phrase]);

  const done = typed.length === phrase.length;

  return (
    <div className="mt-8 max-w-lg rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur">
      <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-3 font-mono text-[15px]">
        <span className="text-white/40">&rsaquo;</span>
        <span>{typed}</span>
        <span className="-ml-2 h-5 w-0.5 animate-pulse bg-lotus-400" />
      </div>
      <div className="mt-3 flex min-h-[40px] flex-wrap gap-2">
        <AnimatePresence>
          {done &&
            phrase.split(" ").map((w, i) => (
              <motion.span
                key={`${idx}-${w}-${i}`}
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.18, type: "spring", stiffness: 300, damping: 22 }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-lotus-400 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-ink"
              >
                <span aria-hidden="true">&#9995;</span> {w}
              </motion.span>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Counter({ to }: { to: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1400);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n}</span>;
}

const card = "h-full rounded-[28px] p-7 sm:p-9";

export function AboutEvent() {
  return (
    <section id="features" aria-labelledby="features-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal className="grid items-end gap-6 lg:grid-cols-2">
        <div>
          <p className="label">What you can do &middot; 03</p>
          <h2 id="features-heading" className="display mt-4 text-4xl sm:text-6xl">
            Some of it works <span className="italic text-brand-500">today.</span>
          </h2>
        </div>
        <p className="lead lg:pb-2">The rest is being built. Every feature is labelled, so you always know what to expect.</p>
      </Reveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-6">
        <Reveal className="lg:col-span-4">
          <SpotlightCard href="/demo" glow="rgba(216,188,138,0.16)" tilt={2} className={`${card} flex flex-col bg-ink text-white sm:min-h-[420px]`}>
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl" />
            <span><Status live dark>Available now</Status></span>
            <h3 className="display mt-6 max-w-md text-3xl sm:text-5xl">Speak or type. The avatar signs it.</h3>
            <p className="mt-4 max-w-md text-lg leading-8 text-white/70">
              Watch phrases arranged in ISL word order. Replay them, or slow them to half speed.
            </p>
            <TypingDemo />
            <span className="mt-auto inline-flex items-center gap-2 pt-8 font-bold">
              Open the demo <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </SpotlightCard>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <SpotlightCard href="/signs" className={`${card} flex flex-col bg-brand-50 ring-1 ring-brand-500/10`}>
            <span><Status live>Available now</Status></span>
            <span aria-hidden="true" className="mt-6 font-serif text-8xl font-semibold tracking-tight text-brand-500">
              <Counter to={284} />
            </span>
            <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Sign dictionary</h3>
            <p className="mt-2 text-base leading-7 text-ink/70">Search a word and watch it signed. Every word has a link you can share.</p>
            <div aria-hidden="true" className="mt-5 flex flex-wrap gap-1.5">
              {["hello", "water", "family", "help", "friend"].map((w) => (
                <span key={w} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/60 ring-1 ring-ink/10 transition group-hover:ring-brand-500/30">
                  {w}
                </span>
              ))}
            </div>
            <span className="mt-auto inline-flex items-center gap-2 pt-6 font-bold text-brand-600">
              Browse signs <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </SpotlightCard>
        </Reveal>

        <Reveal delay={60} className="lg:col-span-3">
          <SpotlightCard className={`${card} bg-white ring-1 ring-ink/10`}>
            <Status>In development</Status>
            <h3 className="mt-6 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">ISL to text and speech</h3>
            <p className="mt-3 max-w-md text-base leading-7 text-ink/70">
              Sign to your camera. Your words appear as text and are spoken aloud for the people around you.
            </p>
            <div aria-hidden="true" className="mt-7 space-y-2 text-[15px]">
              <div className="ml-auto w-fit rounded-2xl rounded-br-md bg-brand-500 px-4 py-2.5 text-white transition-transform duration-500 group-hover:-translate-x-2">
                Where is the station?
              </div>
              <div className="w-fit rounded-2xl rounded-bl-md bg-ink/[0.06] px-4 py-2.5 transition-transform duration-500 group-hover:translate-x-2">
                Two streets ahead, on your left.
              </div>
            </div>
          </SpotlightCard>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-3">
          <SpotlightCard className={`${card} flex flex-col bg-white ring-1 ring-ink/10`}>
            <span><Status>Planned</Status></span>
            <h3 className="mt-6 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Meeting assistant</h3>
            <p className="mt-3 max-w-md text-base leading-7 text-ink/70">Joins online calls and turns your signing into live text everyone can read.</p>
            <div className="relative mt-7 aspect-[16/7] overflow-hidden rounded-2xl">
              <Image src="/image/isl-meeting-photo.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute bottom-3 left-3 rounded-lg bg-ink/80 px-3 py-1.5 text-sm text-white backdrop-blur">
                Live text: &ldquo;I agree with the plan.&rdquo;
              </span>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}

export default AboutEvent;
