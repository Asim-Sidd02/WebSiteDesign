"use client";

import { IconButton, Button, Typography } from "@material-tailwind/react";
<head>
<title>SignSense</title>
<link rel="icon" href="./../../public/image/signsense.png" type="image/png" />
</head>
function Hero() {
  return (
    
    <div className="relative min-h-screen w-full bg-black">
      
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src="/image/video.mp4"  // Make sure to replace this with the correct path to your video file
      autoPlay
      loop
      muted
    />
    <div className="absolute inset-0 h-full w-full bg-gray-900/60" />
    <div className="grid min-h-screen px-8">
      <div className="container relative z-10 my-auto mx-auto grid place-items-center text-center">
        
        <Typography variant="h1" color="white" className="lg:max-w-3xl"
         placeholder=""
         onPointerEnterCapture={() => {}}
         onPointerLeaveCapture={() => {}}>
          Sign Sense
        </Typography>
        <Typography
          variant="lead"
          color="white"
          className="mt-1 mb-12 w-full md:max-w-full lg:max-w-2xl"
          placeholder=""
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
        >
          Your Bridge To The World of Silent Communication.

        </Typography>
        <div className="flex items-center gap-4">
          <Button variant="gradient" color="white"
           placeholder=""
           onPointerEnterCapture={() => {}}
           onPointerLeaveCapture={() => {}}>
            Sign to Text
          </Button>
          <Link to="https://text2signs.netlify.app/" target="_blank" rel="noopener noreferrer">
          <Button variant="gradient" color="white"
           placeholder=""
           onPointerEnterCapture={() => {}}
           onPointerLeaveCapture={() => {}}>
            Text to Sign
          </Button>
         
        </div>
      </div>
    </div>
  </div>
  );
}

export default Hero;
