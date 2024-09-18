"use client";

import { Button, Typography } from "@material-tailwind/react";

function Hero() {
  const handleTextToSignClick = () => {
    window.open('https://text2signs.netlify.app/', '_blank');
  };

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
          <Typography
            variant="h1"
            color="white"
            className="lg:max-w-3xl"
          >
            Sign Sense
          </Typography>
          <Typography
            variant="lead"
            color="white"
            className="mt-1 mb-12 w-full md:max-w-full lg:max-w-2xl"
          >
            Your Bridge To The World of Silent Communication.
          </Typography>
          <div className="flex items-center gap-4">
            <Button
              variant="gradient"
              color="white"
            >
              Sign to Text
            </Button>
            <Button
              variant="gradient"
              color="white"
              onClick={handleTextToSignClick} // Navigate to URL
            >
              Text to Sign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
