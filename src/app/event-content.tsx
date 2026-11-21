import Image from "next/image";
import Reveal from "@/components/reveal";

const USE_CASES = [
  {
    tag: "At home",
    image: "/image/isl-conversation-photo.png",
    alt: "A Deaf Indian woman signing during a video conversation at home",
    title: "Talk with family who don't sign",
    body: "Your signs appear as text or speech. Their replies are signed back to you.",
    live: true,
  },
  {
    tag: "At work",
    image: "/image/isl-meeting-photo.png",
    alt: "A Deaf Indian professional signing during a remote team meeting",
    title: "Take part in meetings",
    body: "Your signing becomes live text that everyone on the call can read.",
    live: false,
  },
  {
    tag: "At events",
    image: "/image/isl-seminar-avatar.png",
    alt: "A seminar speaker on stage while an Indian Sign Language avatar appears on the screen for attendees",
    title: "Follow talks from any seat",
    body: "The speaker's words are signed in ISL by the avatar on the event screen.",
    live: false,
  },
];

export function EventContent() {
  return (
    <section id="use-case" aria-labelledby="use-heading" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="rule">
        <span>Where it helps</span>
        <span className="text-ink/40">04</span>
      </div>

      <Reveal className="mt-10 max-w-2xl">
        <h2 id="use-heading" className="display text-4xl sm:text-5xl">
          Wherever the conversation happens.
        </h2>
        <p className="mt-4 text-lg leading-8 text-ink/65">At home, at work and at events.</p>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {USE_CASES.map((item, i) => (
          <Reveal key={item.tag} delay={i * 80} className="h-full">
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition-shadow duration-300 hover:shadow-[0_20px_40px_-20px_rgba(12,31,34,0.25)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-sm font-bold text-brand-600">{item.tag}</p>
                <h3 className="mt-2 text-xl font-bold leading-snug text-ink">{item.title}</h3>
                <p className="mt-2 text-base leading-7 text-ink/65">{item.body}</p>

                <div className="mt-auto pt-6">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                      item.live ? "bg-brand-50 text-brand-700" : "bg-ink/[0.05] text-ink/55"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${item.live ? "bg-brand-500" : "bg-ink/30"}`} />
                    {item.live ? "Available now" : "Planned"}
                  </span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default EventContent;
