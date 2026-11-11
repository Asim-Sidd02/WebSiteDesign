"use client";

import { useEffect, useRef, useState } from "react";

export default function SpeechDemo() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "signsense-demo-height" && Number.isFinite(event.data.height)) {
        setHeight(Math.max(720, Math.min(event.data.height, 2600)));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <section id="free-demo" className="border-y border-ink/10 bg-[#f2f1ed]">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-8 sm:px-8 sm:pb-12 sm:pt-12">
        <div className="mb-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="label">Free interactive demo</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
              Speak a phrase. See the avatar sign.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-ink/60">
              The included ISL vocabulary loads automatically. Try phrases such as “hello”, “good morning”, “thank you” or “help”, or{" "}
              <a href="/signs" className="font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-brand-500">
                browse every sign in the dictionary
              </a>
              .
            </p>
          </div>
          <a href="/#how" className="text-sm font-semibold text-brand-600 underline decoration-brand-500/30 underline-offset-4 hover:decoration-brand-500">
            How SignSense works ↓
          </a>
        </div>
        <iframe
          ref={frameRef}
          src="/voice-demo/index.html"
          title="SignSense free speech-to-ISL avatar demo"
          allow="microphone; camera; fullscreen; on-device-speech-recognition"
          allowFullScreen
          loading="lazy"
          className="block w-full rounded-2xl border border-ink/10 bg-paper shadow-[0_24px_70px_-45px_rgba(13,13,18,0.35)]"
          style={{ height }}
        />
      </div>
    </section>
  );
}
