import Image from "next/image";

export default function SignLoader() {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-label="Loading SignSense. The avatar is signing hello in Indian Sign Language."
      className="fixed inset-0 z-[100] grid min-h-screen min-h-[100svh] place-items-center overflow-hidden bg-paper px-6 text-ink"
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <Image
            src="/image/signsense-mark.png"
            alt=""
            aria-hidden="true"
            width={96}
            height={96}
            className="loader-logo-mark h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
          />
          <div className="text-left">
            <p className="text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">SignSense</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.17em] text-ink/50">Indian Sign Language</p>
          </div>
        </div>

        <Image
          src="/isl-loader-hello.svg"
          alt=""
          aria-hidden="true"
          width={360}
          height={280}
          unoptimized
          className="mt-9 h-52 w-full max-w-[320px] sm:h-60"
        />
        <p className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">Signing “hello”</p>
        <p className="mt-1 text-sm text-ink/55">Loading an accessible experience</p>
        <div aria-hidden="true" className="mt-6 flex items-center gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" style={{ animationDelay: `${dot * 180}ms` }} />
          ))}
        </div>
        <a href="/voice-demo/SOURCES.md" className="mt-8 text-xs text-ink/45 underline decoration-ink/20 underline-offset-4 hover:text-ink/70">
          Motion source &amp; attribution
        </a>
      </div>
    </main>
  );
}
