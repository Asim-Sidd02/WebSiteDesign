"use client";

import EventContentCard from "@/components/event-content-card";
import { Reveal } from "@/components/reveal";

const EVENT_CONTENT = [
  {
    title: "Daily Communication",
    des: "Working with a colleague who communicates differently? Chat back and forth in real-time and see translations appear instantly, with no transcripts and no awkward pauses. SignSense makes everyday communication feel effortless, whether in meetings, casual conversations, or messaging friends and family.",
    panel: "Where languages unite",
    img: "/image/daily.png",
  },
  {
    title: "Career Development",
    des: "By removing language barriers, SignSense opens doors to global opportunities. Attend conferences, collaborate with clients, or interview for jobs overseas without language getting in the way, and take your career to the next level.",
    panel: "Your passport to opportunity",
    img: "/image/video.png",
  },
  {
    title: "Education",
    des: "SignSense creates a more inclusive learning environment. Students participate fully in discussions and access materials in their own language, fostering better understanding and retention: a classroom where everyone contributes and learns together.",
    panel: "Learning without limits",
    img: "/image/class.png",
  },
];

export function EventContent() {
  return (
    <section
      id="use-case"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#f4f5ff] to-white px-6 py-28"
    >
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className="container relative mx-auto">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Use Cases</span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Built for every <span className="text-gradient">conversation</span>
          </h2>
        </Reveal>
        <div className="mt-20 flex flex-col gap-24">
          {EVENT_CONTENT.map((props, idx) => (
            <Reveal key={idx}>
              <EventContentCard {...props} index={idx} reverse={idx % 2 === 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EventContent;
