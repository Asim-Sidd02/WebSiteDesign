import Reveal from "@/components/reveal";

// Commitments, in plain language.
const PRINCIPLES = [
  ["ISL first", "We build for Indian Sign Language only. Its grammar and word order matter; it is not signed English."],
  ["Honest about limits", "Our signs are early prototypes, not yet reviewed by Deaf ISL experts, and regional signs may differ."],
  ["Nothing depends on sound", "Everything is shown visually. Audio is always optional."],
  ["Support, not replacement", "SignSense is for everyday conversation. For medical, legal or other important matters, use a qualified interpreter."],
];

export default function Principles() {
  return (
    <section aria-labelledby="promise-heading" className="bg-sand">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="rule">
          <span>What we promise</span>
        </div>
        <div className="mt-8 grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <h2 id="promise-heading" className="display text-4xl sm:text-5xl lg:col-span-4">
            Trust is earned.
          </h2>
          <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-8">
            {PRINCIPLES.map(([title, body], i) => (
              <Reveal key={title} delay={i * 60}>
                <dt className="text-lg font-bold">{title}</dt>
                <dd className="mt-2 text-base leading-7 text-ink/70">{body}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
