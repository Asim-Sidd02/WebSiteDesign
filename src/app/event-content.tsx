"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CASES = [
  {
    tag: "Everyday",
    title: "At the counter, at the doctor's, at dinner.",
    body: "The small conversations add up. Ordering coffee, asking a pharmacist a question, chatting with a friend's family. SignSense makes them quick instead of awkward.",
    img: "/image/daily.png",
  },
  {
    tag: "Work",
    title: "In the meeting, not after it.",
    body: "Join the discussion live instead of reading the notes later. Interviews, client calls and conferences become open to you without a booking.",
    img: "/image/video.png",
  },
  {
    tag: "School",
    title: "Raise your hand and be understood.",
    body: "Students can ask questions and join class discussions directly, and teachers can answer them in the same moment.",
    img: "/image/class.png",
  },
];

function Case({ c, i }: { c: (typeof CASES)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const flip = i % 2 === 1;

  return (
    <div ref={ref} className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${flip ? "md:[&>*:first-child]:order-2" : ""}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink/5">
        <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
          <Image src={c.img} alt={c.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <p className="label">{c.tag}</p>
        <h3 className="display mt-5 text-4xl sm:text-6xl">{c.title}</h3>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/60">{c.body}</p>
      </motion.div>
    </div>
  );
}

export function EventContent() {
  return (
    <section id="use-case" className="border-t border-ink/10 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <p className="label">Where it helps</p>
        <h2 className="display mt-6 max-w-3xl text-5xl sm:text-7xl">
          Built for the moments that <span className="italic text-brand-500">matter.</span>
        </h2>
        <div className="mt-24 flex flex-col gap-32">
          {CASES.map((c, i) => (
            <Case key={c.tag} c={c} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default EventContent;
