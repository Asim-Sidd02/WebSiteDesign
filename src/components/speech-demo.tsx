"use client";

import { useEffect, useRef, useState } from "react";

const clampHeight = (h: number) => Math.max(560, Math.min(h, 2600));

export default function SpeechDemo() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let observer: ResizeObserver | null = null;

    // Same-origin iframe: measure its document directly. Messages alone can arrive before hydration and be missed.
    const attach = () => {
      const doc = frame.contentDocument;
      if (!doc?.body) return;
      const measure = () => !doc.fullscreenElement && setHeight(clampHeight(doc.documentElement.scrollHeight));
      measure();
      observer?.disconnect();
      observer = new ResizeObserver(measure);
      observer.observe(doc.body);
    };
    if (frame.contentDocument?.readyState === "complete" && frame.contentDocument.body?.childElementCount) attach();
    frame.addEventListener("load", attach);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.contentWindow) return;
      if (event.data?.type === "signsense-demo-height" && Number.isFinite(event.data.height)) {
        setHeight(clampHeight(event.data.height));
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      observer?.disconnect();
      frame.removeEventListener("load", attach);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <section id="free-demo" className="border-y border-ink/10 bg-[#f2f1ed]">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-8 sm:pb-12 sm:pt-12">
        <div className="mb-6 grid gap-4 px-1 sm:mb-8 sm:gap-5 sm:px-0 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="label">Free interactive demo</p>
            <h2 className="mt-3 max-w-3xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.045em] sm:mt-4 sm:text-5xl">
              Speak a phrase. See the avatar sign.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink/60 sm:mt-4 sm:text-base">
              The included ISL vocabulary loads automatically. Try phrases such as “hello”, “good morning”, “thank you” or “help”, or{" "}
              <a href="/signs" className="font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-brand-500">
                browse every sign in the dictionary
              </a>
              .
            </p>
          </div>
          <a href="/#how" className="hidden text-sm font-semibold text-brand-600 underline decoration-brand-500/30 underline-offset-4 hover:decoration-brand-500 md:inline">
            How SignSense works ↓
          </a>
        </div>
        <iframe
          ref={frameRef}
          src="/voice-demo/index.html?framed=1"
          title="SignSense free speech-to-ISL avatar demo"
          allow="microphone; camera; fullscreen; on-device-speech-recognition"
          allowFullScreen
          className="block w-full rounded-2xl border border-ink/10 bg-white shadow-[0_24px_70px_-45px_rgba(13,13,18,0.35)] sm:rounded-3xl"
          style={{ height }}
        />
      </div>
    </section>
  );
}
