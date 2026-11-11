"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const USE_CASES = [
  {
    tag: "Everyday conversations",
    image: "/image/isl-conversation-photo.png",
    alt: "A Deaf Indian woman signing during a video conversation at home",
    title: "Make everyday conversations easier to follow.",
    body: "Share ISL as text or audio, and receive spoken or written replies as signed output from a 3D avatar.",
    wide: false,
  },
  {
    tag: "Work & meetings",
    image: "/image/isl-meeting-photo.png",
    alt: "A Deaf Indian professional signing during a remote team meeting",
    title: "Bring ISL into the meeting.",
    body: "A meeting assistant is planned to join online calls and help convert ISL signing into live text for participants.",
    wide: false,
  },
  {
    tag: "Seminars & events",
    image: "/image/isl-seminar-avatar.png",
    alt: "A seminar speaker presents on stage as an Indian Sign Language avatar appears on the screen for attendees",
    title: "Make live seminars more accessible.",
    body: "As a speaker presents, SignSense can convert their speech into Indian Sign Language and show it through a 3D avatar on the event screen, helping Deaf and hard-of-hearing attendees follow along.",
    wide: true,
  },
];

export function EventContent() {
  return (
    <section id="use-case" className="border-y border-ink/10 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-32">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="label">Where SignSense fits</p>
            <h2 className="mt-5 max-w-3xl text-[2.25rem] font-semibold sm:text-4xl leading-tight tracking-[-0.045em] sm:text-6xl">
              Communication that moves with <span className="text-brand-500">you.</span>
            </h2>
          </div>
          <p className="max-w-sm text-base leading-7 text-ink/60">
            From everyday conversations to online meetings and live seminars, built around Indian Sign Language.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.65 }}
          className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:mt-14 sm:grid sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-2"
        >
          {USE_CASES.map((item) => (
            <article
              key={item.tag}
              className={`w-[86%] shrink-0 snap-start overflow-hidden rounded-2xl border border-ink/10 bg-paper sm:w-auto ${item.wide ? "lg:col-span-2 lg:grid lg:grid-cols-2" : ""}`}
            >
              <div className={`relative aspect-[16/9] overflow-hidden bg-[#e8e5df] ${item.wide ? "lg:aspect-auto lg:min-h-[340px]" : ""}`}>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>
              <div className={`p-6 sm:p-9 ${item.wide ? "lg:flex lg:flex-col lg:justify-center lg:p-12" : ""}`}>
                <p className="label">{item.tag}</p>
                <h3 className="mt-3 max-w-xl text-xl font-semibold sm:text-2xl leading-tight tracking-[-0.03em] sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-xl text-[15px] leading-7 text-ink/60 sm:text-base">{item.body}</p>
              </div>
            </article>
          ))}
        </motion.div>
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink/40 sm:hidden" aria-hidden="true">
          Swipe for more →
        </p>
      </div>
    </section>
  );
}

export default EventContent;
