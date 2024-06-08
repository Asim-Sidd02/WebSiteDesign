"use client";

import React from "react";
import { Typography, Accordion, AccordionHeader, AccordionBody } from "@material-tailwind/react";

const FAQS = [
  {
    title: "1. How do I use SignSense for two-way conversations?",
    desc: "SignSense allows both parties to speak naturally in their respective languages. The app will translate the conversation in real-time, ensuring clear communication.",
  },
  {
    title: "2. Can I use SignSense with video conferencing?",
    desc: "Yes! SignSense can be used to facilitate seamless communication during video conferences, even when participants speak different languages.",
  },
  {
    title: "3.How can SignSense help me with my career?",
    desc: "By breaking down language barriers, SignSense opens doors to global opportunities. You can attend conferences, collaborate with international clients, or even interview for jobs overseas.",
  },
  {
    title: "4. What languages does SignSense support?",
    desc: "SignSense offers comprehensive multilingual support, translating content to and from a wide range of languages, including common ones like English, Spanish, and Mandarin, as well as less common languages.",
  },
 
];

export function Faq() {
  const [open, setOpen] = React.useState(0);
  const handleOpen = (value: number) => setOpen(open === value ? 0 : value);

  return (
    <section id="faq" className="py-8 px-8 lg:py-20">
      <div className="container mx-auto">
        <div className="text-center">
          <Typography variant="h1" color="blue-gray" className="mb-4"
           placeholder=""
           onPointerEnterCapture={() => {}}
           onPointerLeaveCapture={() => {}}>
            Frequently asked questions
          </Typography>
          <Typography
            variant="lead"
            className="mx-auto mb-24 lg:w-3/5 !text-gray-500"
            placeholder=""
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
          Welcome to the SignSense FAQ!  We are here to address your most common queries and equip you with the information you need to unlock the power of seamless communication.  SignSense empowers you to bridge language barriers and connect with the world around you.
          </Typography>
        </div>

        <div className="mx-auto lg:max-w-screen-lg lg:px-20">
          {FAQS.map(({ title, desc }, key) => (
            <Accordion
            placeholder=""
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
              key={key}
              open={open === key + 1}
              onClick={() => handleOpen(key + 1)}
            >
              <AccordionHeader className="text-left text-gray-900"
               placeholder=""
               onPointerEnterCapture={() => {}}
               onPointerLeaveCapture={() => {}}>
                {title}
              </AccordionHeader>
              <AccordionBody>
                <Typography
                  color="blue-gray"
                  className="font-normal text-gray-500"
                  placeholder=""
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                >
                  {desc}
                </Typography>
              </AccordionBody>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
}


export default Faq;
