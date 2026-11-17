import HeroAvatar from "@/components/hero-avatar";

const FACTS = [
  ["284", "signs ready to watch"],
  ["2", "open ISL datasets"],
  ["0", "sign-ups needed"],
];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#eeedfb_0%,#faf7f2_85%)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(20,18,43,0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-32 sm:px-8 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28">
        <div>
          <a
            href="/signs"
            className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-1.5 pr-4 text-sm font-bold text-ink/70 shadow-sm ring-1 ring-ink/10 backdrop-blur transition hover:ring-brand-500/40"
          >
            <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs text-white">New</span>
            284 signs in the ISL dictionary <span aria-hidden="true">→</span>
          </a>
          <h1 className="display mt-7 text-[3.1rem] sm:text-7xl lg:text-[5.25rem]">
            Sign freely.
            <br />
            <span className="bg-gradient-to-r from-brand-500 to-[#7b5cff] bg-clip-text text-transparent">Be understood.</span>
          </h1>
          <p className="lead mt-6 max-w-xl">
            SignSense turns your Indian Sign Language into text and speech, and turns the other person&rsquo;s words into signs, shown by a 3D avatar.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="/demo" className="btn-primary px-8">
              Try the full demo <span aria-hidden="true">→</span>
            </a>
            <a href="#how" className="btn-secondary bg-white/70 px-8">
              See how it works
            </a>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-ink/10 pt-7">
            {FACTS.map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{value}</span>
                  <span className="mt-1 block text-sm leading-5 text-ink/60">{label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroAvatar />
      </div>
    </section>
  );
}

export default Hero;
