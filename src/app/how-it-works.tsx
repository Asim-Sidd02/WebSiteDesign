import Reveal from "@/components/reveal";

const STEPS = [
  { title: "You sign", body: "Sign in front of your camera, the way you normally would. Your words appear as text, and can be spoken aloud." },
  { title: "They reply", body: "The other person speaks or types. The avatar signs their reply in ISL." },
  { title: "Go at your pace", body: "Replay any sign, or slow it to half speed. Nothing moves on until you're ready." },
];

export default function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-heading" className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="rule border-white/20 text-saffron-400">
          <span>How it works</span>
        </div>
        <div className="mt-8 grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <h2 id="how-heading" className="display text-4xl sm:text-5xl lg:col-span-4">
            Three steps, in both directions.
          </h2>
          <ol className="grid gap-10 sm:grid-cols-3 sm:gap-8 lg:col-span-8">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 80}>
                <span className="font-serif font-semibold tracking-tight text-5xl text-saffron-400">{i + 1}</span>
                <h3 className="mt-4 border-t border-white/25 pt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-base leading-7 text-white/70">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
