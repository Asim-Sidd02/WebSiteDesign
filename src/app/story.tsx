"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const TEXT =
  "Most conversations still assume everyone can hear. For millions of Deaf and hard of hearing people, that means waiting for an interpreter, writing on scraps of paper, or simply being left out. We built SignSense so the conversation can just happen.";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  );
}

export default function Story() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = TEXT.split(" ");

  return (
    <section className="mx-auto max-w-7xl px-5 py-32 sm:px-8 sm:py-44">
      <p className="label mb-10">Why we exist</p>
      <p ref={ref} className="display max-w-6xl text-4xl leading-[1.12] sm:text-6xl">
        {words.map((w, i) => (
          <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </p>
    </section>
  );
}
