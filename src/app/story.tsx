"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/reveal";

type Line = { from: "me" | "them"; kind: "sign" | "text" | "voice"; text: string };

const PEOPLE: { key: string; who: string; quote: string; need: string; chat: Line[] }[] = [
  {
    key: "signer",
    who: "I sign",
    quote: "I'm tired of writing everything down, or waiting for an interpreter.",
    need: "Sign as you normally would. SignSense shows your words as text and speaks them, so the other person can follow.",
    chat: [
      { from: "me", kind: "sign", text: "Doctor appointment, what time?" },
      { from: "them", kind: "voice", text: "Your appointment is at four o'clock." },
      { from: "me", kind: "sign", text: "Thank you. See you then." },
    ],
  },
  {
    key: "learner",
    who: "I don't sign yet",
    quote: "I want to talk to my colleague, but I don't know ISL.",
    need: "Speak or type as usual. The avatar signs your message in Indian Sign Language.",
    chat: [
      { from: "me", kind: "text", text: "Good morning! Coffee before the meeting?" },
      { from: "them", kind: "sign", text: "Yes. Five minutes." },
      { from: "me", kind: "voice", text: "Great, I'll wait by the door." },
    ],
  },
  {
    key: "team",
    who: "I run events or a team",
    quote: "We want every talk and meeting to include Deaf people.",
    need: "Put a speaker's words on screen in ISL, and bring signed contributions into calls as text.",
    chat: [
      { from: "them", kind: "voice", text: "Welcome everyone to today's session." },
      { from: "me", kind: "sign", text: "Question: will slides be shared?" },
      { from: "them", kind: "voice", text: "Yes, we'll email them after the talk." },
    ],
  },
];

const KIND_LABEL = { sign: "Signed", text: "Typed", voice: "Spoken" } as const;

function Chat({ lines }: { lines: Line[] }) {
  const [shown, setShown] = React.useState(0);
  React.useEffect(() => {
    setShown(0);
    const timers = lines.map((_, i) => setTimeout(() => setShown(i + 1), 450 + i * 1100));
    return () => timers.forEach(clearTimeout);
  }, [lines]);

  return (
    <div className="flex min-h-[260px] flex-col gap-3">
      {lines.slice(0, shown).map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className={`max-w-[85%] ${l.from === "me" ? "self-end text-right" : "self-start"}`}
        >
          <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink/45">
            <span className={`h-1.5 w-1.5 rounded-full ${l.kind === "sign" ? "bg-lotus-500" : "bg-brand-500"}`} />
            {KIND_LABEL[l.kind]}
          </span>
          <div
            className={`rounded-2xl px-4 py-3 text-[15px] leading-6 ${
              l.from === "me" ? "rounded-br-md bg-brand-500 text-white" : "rounded-bl-md bg-white text-ink ring-1 ring-ink/10"
            }`}
          >
            {l.text}
          </div>
        </motion.div>
      ))}
      {shown < lines.length && (
        <div className={`flex gap-1 rounded-2xl bg-white px-4 py-3 ring-1 ring-ink/10 ${lines[shown].from === "me" ? "self-end" : "self-start"}`}>
          {[0, 1, 2].map((d) => (
            <motion.span
              key={d}
              className="h-2 w-2 rounded-full bg-ink/30"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Story() {
  const [active, setActive] = React.useState(0);
  const p = PEOPLE[active];

  return (
    <section id="who" aria-labelledby="who-heading" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-32">
      <div className="rule">
        <span>Who it&rsquo;s for</span>
        <span className="text-ink/40">01</span>
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-x-10">
        <Reveal className="lg:col-span-5">
          <h2 id="who-heading" className="display text-4xl sm:text-5xl">
            A conversation has <em className="text-brand-500">two sides.</em>
          </h2>
          <p className="mt-5 text-lg leading-8 text-ink/70">
            Millions of people in India sign, but very few hearing people know ISL. Pick who you are and see what a conversation looks like.
          </p>

          <div
            role="tablist"
            aria-label="Choose who you are"
            aria-orientation="vertical"
            className="mt-8 flex flex-col gap-2"
            onKeyDown={(e) => {
              const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
              if (!step) return;
              e.preventDefault();
              const next = (active + step + PEOPLE.length) % PEOPLE.length;
              setActive(next);
              (e.currentTarget.children[next] as HTMLElement | undefined)?.focus();
            }}
          >
            {PEOPLE.map((person, i) => {
              const on = i === active;
              return (
                <button
                  key={person.key}
                  role="tab"
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`relative flex items-center justify-between rounded-2xl px-5 py-4 text-left transition-colors ${
                    on ? "text-white" : "text-ink hover:bg-ink/[0.04]"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="persona-pill"
                      className="absolute inset-0 rounded-2xl bg-ink"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative text-lg font-bold">{person.who}</span>
                  <span aria-hidden="true" className={`relative transition-transform ${on ? "translate-x-0 text-lotus-400" : "-translate-x-1 text-ink/30"}`}>
                    &rarr;
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-[28px] bg-sand p-6 ring-1 ring-ink/10 sm:p-9">
            <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
            <AnimatePresence mode="wait">
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <blockquote className="font-serif text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                  &ldquo;{p.quote}&rdquo;
                </blockquote>
                <p className="mt-3 max-w-lg text-base leading-7 text-ink/70">{p.need}</p>
                <div className="mt-7 rounded-2xl bg-paper/70 p-4 ring-1 ring-ink/5 backdrop-blur sm:p-5">
                  <Chat lines={p.chat} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
