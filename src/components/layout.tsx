"use client";

import React from "react";
import { ThemeProvider } from "@material-tailwind/react";
import { MotionConfig } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  // reducedMotion="user": framer-motion animations respect the OS "reduce motion" setting.
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}

export default Layout;
