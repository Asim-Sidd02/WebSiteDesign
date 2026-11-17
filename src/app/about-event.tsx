import Image from "next/image";
import Reveal from "@/components/reveal";

// Each feature carries an honest status, so nobody plans around something that isn't ready yet.
function Status({ live, children }: { live?: boolean; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${live ? "bg-[#e3f6ec] text-[#13693f]" : "bg-ink/[0.06] text-ink/60"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-[#1fa463]" : "bg-ink/35"}`} />
      {children}
    </span>
  );
}

const card = "relative h-full overflow-hidden rounded-[28px] p-7 sm:p-9";

export function AboutEvent() {
  return (
    <section id="features" aria-labelledby="features-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="label">What you can do</p>
        <h2 id="features-heading" className="display mt-4 text-4xl sm:text-6xl">
          Some of it works today.
        </h2>
        <p className="lead mt-5">The rest is being built. Every feature is labelled, so you always know what to expect.</p>
      </Reveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-6">
        <Reveal className="lg:col-span-4">
          <a href="/demo" className={`${card} group flex flex-col bg-ink text-white sm:min-h-[380px]`}>
            <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl" />
            <span className="relative"><Status live>Available now</Status></span>
            <h3 className="display relative mt-6 max-w-md text-3xl sm:text-5xl">Speak or type. The avatar signs it.</h3>
            <p className="relative mt-4 max-w-md text-lg leading-8 text-white/70">
              Type or say a phrase and watch it signed in ISL word order. Replay it, or slow it to half speed.
            </p>
            <span className="relative mt-auto inline-flex items-center gap-2 pt-8 font-bold">
              Open the demo <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </a>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <a href="/signs" className={`${card} group flex flex-col bg-brand-50 ring-1 ring-brand-500/10`}>
            <span><Status live>Available now</Status></span>
            <span aria-hidden="true" className="mt-6 font-serif text-7xl font-semibold tracking-tight text-brand-500">284</span>
            <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Sign dictionary</h3>
            <p className="mt-2 text-base leading-7 text-ink/70">Search a word and watch it signed. Every word has a link you can share.</p>
            <span className="mt-auto inline-flex items-center gap-2 pt-6 font-bold text-brand-600">
              Browse signs <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </a>
        </Reveal>

        <Reveal delay={60} className="lg:col-span-3">
          <div className={`${card} bg-white ring-1 ring-ink/10`}>
            <Status>In development</Status>
            <h3 className="mt-6 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">ISL to text and speech</h3>
            <p className="mt-3 max-w-md text-base leading-7 text-ink/70">
              Sign to your camera. Your words appear as text and are spoken aloud for the people around you.
            </p>
            <div aria-hidden="true" className="mt-7 space-y-2 text-[15px]">
              <div className="ml-auto w-fit rounded-2xl rounded-br-md bg-brand-500 px-4 py-2.5 text-white">Where is the station?</div>
              <div className="w-fit rounded-2xl rounded-bl-md bg-ink/[0.06] px-4 py-2.5">Two streets ahead, on your left.</div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-3">
          <div className={`${card} flex flex-col bg-white ring-1 ring-ink/10`}>
            <span><Status>Planned</Status></span>
            <h3 className="mt-6 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Meeting assistant</h3>
            <p className="mt-3 max-w-md text-base leading-7 text-ink/70">Joins online calls and turns your signing into live text everyone can read.</p>
            <div className="relative mt-7 aspect-[16/7] overflow-hidden rounded-2xl">
              <Image src="/image/isl-meeting-photo.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
              <span className="absolute bottom-3 left-3 rounded-lg bg-ink/80 px-3 py-1.5 text-sm text-white backdrop-blur">Live text: &ldquo;I agree with the plan.&rdquo;</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default AboutEvent;
