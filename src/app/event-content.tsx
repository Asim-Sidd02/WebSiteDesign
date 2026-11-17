import Image from "next/image";
import Reveal from "@/components/reveal";

const USE_CASES = [
  {
    tag: "At home",
    image: "/image/isl-conversation-photo.png",
    alt: "A Deaf Indian woman signing during a video conversation at home",
    title: "With family who don't sign",
    body: "Share your signs as text or speech, and see their replies signed back to you.",
  },
  {
    tag: "At work",
    image: "/image/isl-meeting-photo.png",
    alt: "A Deaf Indian professional signing during a remote team meeting",
    title: "In meetings, not just watching them",
    body: "A planned meeting assistant will turn your signing into live text everyone on the call can read.",
  },
  {
    tag: "At events",
    image: "/image/isl-seminar-avatar.png",
    alt: "A seminar speaker on stage while an Indian Sign Language avatar appears on the screen for attendees",
    title: "At talks, from any seat",
    body: "As a speaker presents, SignSense can show their words in ISL through the avatar on the event screen.",
  },
];

export function EventContent() {
  return (
    <section id="use-case" aria-labelledby="use-heading" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="rule">
        <span>Where it helps</span>
      </div>
      <h2 id="use-heading" className="display mt-8 max-w-2xl text-4xl sm:text-5xl">
        Wherever the conversation happens.
      </h2>

      <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {USE_CASES.map((item, i) => (
          <Reveal key={item.tag} delay={i * 80}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand ring-1 ring-ink/10">
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <figcaption className="mt-5">
                <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-saffron-600">{item.tag}</span>
                <span className="mt-2 block font-serif text-2xl font-semibold tracking-tight">{item.title}</span>
                <span className="mt-2 block text-base leading-7 text-ink/70">{item.body}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default EventContent;
