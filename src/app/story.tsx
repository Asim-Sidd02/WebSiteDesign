import Reveal from "@/components/reveal";

const PEOPLE = [
  {
    who: "If you sign",
    quote: "I'm tired of writing everything down, or waiting for an interpreter.",
    need: "Sign as you normally would. SignSense shows your words as text and speaks them, so the other person can follow.",
  },
  {
    who: "If you don't sign yet",
    quote: "I want to talk to my colleague, but I don't know ISL.",
    need: "Speak or type as usual. The avatar signs your message in Indian Sign Language.",
  },
  {
    who: "If you run events or a team",
    quote: "We want every talk and meeting to include Deaf people.",
    need: "Put a speaker's words on screen in ISL, and bring signed contributions into calls as text.",
  },
];

export default function Story() {
  return (
    <section aria-labelledby="who-heading" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-32">
      <div className="rule">
        <span>Who it&rsquo;s for</span>
      </div>
      <div className="mt-8 grid gap-y-8 lg:grid-cols-12 lg:gap-x-8">
        <Reveal className="lg:col-span-5">
          <h2 id="who-heading" className="display text-4xl sm:text-5xl">
            A conversation has two sides.
          </h2>
          <p className="mt-5 text-lg leading-8 text-ink/70">
            Millions of people in India sign, but very few hearing people know ISL. We design for both people in the conversation, starting with the Deaf signer.
          </p>
        </Reveal>

        <ul className="divide-y divide-ink/15 border-y border-ink/15 lg:col-span-6 lg:col-start-7">
          {PEOPLE.map((p, i) => (
            <Reveal as="li" key={p.who} delay={i * 80} className="py-7">
              <p className="text-sm font-bold text-saffron-600">{p.who}</p>
              <blockquote className="mt-2 font-serif font-semibold tracking-tight text-2xl leading-snug">&ldquo;{p.quote}&rdquo;</blockquote>
              <p className="mt-3 text-base leading-7 text-ink/70">{p.need}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
