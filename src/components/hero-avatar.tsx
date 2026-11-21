"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PHRASES = ["hello", "thank you", "good morning", "help", "friend"];

/** A live, tappable avatar: the fastest way to show what SignSense does is to let people try it. */
export default function HeroAvatar() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const queued = useRef<string | null>("hello");

  const post = useCallback((message: object) => {
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.source !== "signsense-avatar") return;
      if (event.data.type === "ready") setReady(true);
      if (event.data.type === "playing") setPlaying(true);
      if (event.data.type === "ended" || event.data.type === "error") setPlaying(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The avatar announces "ready" once; ask again in case we missed it.
  useEffect(() => {
    if (ready) return;
    const ping = () => post({ type: "signsense-ping" });
    ping();
    const id = window.setInterval(ping, 1000);
    return () => window.clearInterval(id);
  }, [ready, post]);

  useEffect(() => {
    if (ready && queued.current) {
      const text = queued.current;
      queued.current = null;
      setCurrent(text);
      post({ type: "signsense-play", text });
    }
  }, [ready, post]);

  const play = (text: string) => {
    setCurrent(text);
    if (!ready) {
      queued.current = text;
      return;
    }
    post({ type: "signsense-play", text });
  };

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      {/* No frame: the avatar stands on the page itself, lit by a soft glow and faded at the bottom edge. */}
      <div className="relative aspect-[1/1.02]">
        <div aria-hidden="true" className="absolute left-1/2 top-[8%] h-[78%] w-[78%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(20,184,166,0.28),rgba(14,133,119,0.10)_60%,transparent)]" />
        <iframe
          ref={frameRef}
          src="/voice-demo/index.html?embed=1&transparent=1"
          title="SignSense avatar. Choose a phrase below to see it signed."
          className="absolute inset-0 h-full w-full bg-transparent"
          // The camera frames her from the thighs up, so fade the lower edge into the page instead of a hard cut.
          style={{ colorScheme: "normal", maskImage: "linear-gradient(to bottom, black 78%, transparent 98%)", WebkitMaskImage: "linear-gradient(to bottom, black 78%, transparent 98%)" }}
        />
        <span className="pointer-events-none absolute left-0 top-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink/70 shadow-[0_8px_24px_-10px_rgba(12,31,34,0.3)] ring-1 ring-ink/5 backdrop-blur">
          <span className={`h-2 w-2 rounded-full ${playing ? "bg-brand-500" : ready ? "bg-[#1fa463]" : "bg-ink/30"}`} />
          {playing ? "Signing" : ready ? "Live avatar" : "Loading avatar…"}
        </span>
        {/* Speech-bubble caption beside her head, never over the hands. */}
        {current && (
          <span
            aria-live="polite"
            className="pointer-events-none absolute right-0 top-[14%] rounded-2xl rounded-bl-md bg-ink px-4 py-2.5 font-serif text-lg font-semibold tracking-tight text-white shadow-[0_12px_30px_-12px_rgba(12,31,34,0.5)] sm:text-xl"
          >
            &ldquo;{current.charAt(0).toUpperCase() + current.slice(1)}&rdquo;
          </span>
        )}
      </div>

      <div className="relative mt-2 text-center">
        <p className="text-sm font-bold text-ink/55">Tap a phrase to see it signed</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {PHRASES.map((p) => (
            <button
              key={p}
              onClick={() => play(p)}
              aria-pressed={current === p}
              className={`min-h-[44px] rounded-full px-4 text-[15px] font-bold shadow-sm ring-1 transition ${
                current === p ? "bg-ink text-white ring-ink" : "bg-white/80 text-ink/80 ring-ink/10 hover:ring-brand-500/40 hover:text-brand-600"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
