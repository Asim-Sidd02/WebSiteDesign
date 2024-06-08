"use client";

import { Typography } from "@material-tailwind/react";
import AboutCard from "@/components/about-card";

const EVENT_INFO = [
  {
    title: "Real-Time Translation!",
    description:
      "SignSense is a real-time translation tool that can translate spoken or written content as it occurs. This means that you can have conversations, presentations, or collaborations with people who speak different languages without having to wait for a manual translation or rely on an external translator. SignSense will translate everything immediately and accurately, so you can communicate more efficiently and productively.",
    subTitle: "",
  },
  {
    title: "Two-Way Translation!",
    description:
      "SignSense is also great for two-way conversations! You and someone who speaks a different language can talk naturally, and SignSense will translate between you in real-time. This eliminates the need for an interpreter or struggling with language barriers. So you can have clear and effective conversations, face-to-face, on the phone, or even over video conferencing.",
    subTitle: "",
  },
];

export function AboutEvent() {
  return (
    <section id="features" className="container mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h6" className="text-center mb-2" color="orange"
       placeholder=""
       onPointerEnterCapture={() => {}}
       onPointerLeaveCapture={() => {}}>
        Features
      </Typography>
      <Typography variant="h3" className="text-center" color="blue-gray"
       placeholder=""
       onPointerEnterCapture={() => {}}
       onPointerLeaveCapture={() => {}}>
        Why Sign Sense?
      </Typography>
      <Typography
        variant="lead"
        className="mt-2 lg:max-w-4xl mb-8 w-full text-center font-normal !text-gray-500"
        placeholder=""
        onPointerEnterCapture={() => {}}
        onPointerLeaveCapture={() => {}}
      >
       SignSense translates sign language to spoken language in real-time, enhancing communication accessibility for the deaf and hard of hearing.
      </Typography>
      <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {EVENT_INFO.map((props, idx) => (
          <AboutCard key={idx} {...props} />
        ))}
        <div className="md:col-span-2">
          <AboutCard
            title="Multilingual Support!"
            subTitle=""
            description="SignSense is even better because it supports a wide range of languages, from common ones like English, Spanish, and Mandarin to less common languages. This means you can communicate with basically anyone around the world, regardless of their native language. SignSense breaks down those language barriers so you can have inclusive conversations, collaborate globally, and understand each other across cultures."
          />
        </div>
      </div>
    </section>
  );
}

export default AboutEvent;
