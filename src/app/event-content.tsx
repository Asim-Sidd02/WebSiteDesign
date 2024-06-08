"use client";

import {
  Tab,
  Tabs,
  TabsHeader,
} from "@material-tailwind/react";

import EventContentCard from "@/components/event-content-card";


const EVENT_CONTENT = [
  {
    title: "Daliy Communication",
    des: "SignSense goes beyond just basic translation. Imagine this: you're working on a project with a colleague who speaks a different language. With SignSense, you can chat back and forth in real-time, and see the translations appear instantly. No more waiting for transcripts or awkward pauses while things get translated. SignSense makes everyday communication feel effortless, like you're speaking the same language, regardless of what your native tongues actually are. This can be a huge advantage in business meetings, casual conversations, or even just texting with friends and family overseas.",
    name: "",
    position: "",
    panel: "Where languages unite, communication excels",
    img: "/image/daily.png",
  },
  {
    title: "Career Development",
    des: "SignSense can be a game-changer for your career. By removing language barriers, it opens doors to all sorts of global opportunities you might not have considered before. Imagine being able to attend conferences, collaborate with clients, or even interview for jobs overseas, all without needing to worry about language getting in the way. SignSense empowers you to take your career to the next level by letting you connect and communicate with professionals around the world.",
    
    panel: "Your passport to global career advancement, where language is no barrier to opportunity",
    img: "/image/video.png",
  },
  {
    title: "Education",
    des: "SignSense isn't just useful for business, it can revolutionize education too! With SignSense, language barriers disappear, creating a more inclusive learning environment for everyone. Students can participate fully in class discussions and access educational materials in their native language, fostering better understanding and retention of information. Imagine a classroom where everyone can contribute and learn together, regardless of their background. SignSense can empower students to achieve their full potential and create a truly global learning experience.",
   
    panel: "More speed. Less spend",
    img: "/image/class.png",
  },
];

export function EventContent() {
  return (
    <section id="use-case" className="py-8 px-8 lg:py-20">
    <Tabs value="Day1" className="mb-8">
      <div className="w-full flex mb-8 flex-col items-center">
        <div className="text-5xl font-bold leading-tight lg:w-3/4 flex flex-wrap items-center justify-center gap-6 text-blue-gray-700">
          Use Cases
        </div>
      </div>
    </Tabs>
    <div className="mx-auto container">
      {EVENT_CONTENT.map((props, idx) => (
        <EventContentCard key={idx} {...props} />
      ))}
    </div>
  </section>
  
  );
}

export default EventContent;
