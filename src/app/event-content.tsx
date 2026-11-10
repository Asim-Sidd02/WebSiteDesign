"use client";

import { motion } from "framer-motion";

const CASES = [
  {
    tag: "Everyday",
    title: "At the counter, at the doctor's, at dinner.",
    body: "Ordering coffee, asking a pharmacist a question, chatting with a friend's family. The small conversations get quick instead of awkward.",
    chat: [
      { me: true, t: "Oat milk latte, please." },
      { me: false, t: "Sure! Anything else?" },
    ],
  },
  {
    tag: "Work",
    title: "In the meeting, not after it.",
    body: "Join the discussion live instead of reading the notes later. Interviews, client calls and team stand-ups, without arranging an interpreter first.",
    chat: [
      { me: false, t: "Any blockers this week?" },
      { me: true, t: "One: the API review. I'll share notes." },
    ],
  },
  {
    tag: "School",
    title: "Raise your hand and be understood.",
    body: "Students ask questions and join class discussions directly, and teachers answer them in the same moment.",
    chat: [
      { me: true, t: "Why does the moon change shape?" },
      { me: false, t: "Great question. Let's draw it." },
    ],
  },
];

export function EventContent() {
  return (
    <section id="use-case" className="border-y border-ink/10 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="label">Where it helps</p>
            <h2 className="display mt-6 max-w-3xl text-5xl sm:text-7xl">
              Built for the moments that <span className="italic text-brand-500">matter.</span>
            </h2>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {CASES.map((c, i) => (
            <motion.article
              key={c.tag}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.2, 0.7, 0.2, 1] }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-paper transition-all duration-500 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_30px_60px_-30px_rgba(13,13,18,0.3)]"
            >
              {/* mini conversation */}
              <div className="flex h-52 flex-col justify-center gap-2 border-b border-ink/10 bg-[radial-gradient(rgba(13,13,18,0.06)_1px,transparent_1px)] p-6 [background-size:18px_18px]">
                {c.chat.map((m) => (
                  <div
                    key={m.t}
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm transition-transform duration-500 ${
                      m.me
                        ? "self-start rounded-bl-md bg-brand-500 text-white group-hover:-translate-x-0.5"
                        : "self-end rounded-br-md border border-ink/10 bg-white group-hover:translate-x-0.5"
                    }`}
                  >
                    {m.t}
                  </div>
                ))}
              </div>
              <div className="flex flex-1 flex-col p-7">
                <p className="label">{c.tag}</p>
                <h3 className="display mt-4 text-3xl leading-[1.05]">{c.title}</h3>
                <p className="mt-4 leading-relaxed text-ink/60">{c.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EventContent;
