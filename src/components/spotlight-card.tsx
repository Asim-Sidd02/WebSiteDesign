"use client";
import React from "react";

/** A card with a soft light that follows the pointer, plus a subtle 3D tilt. */
export function SpotlightCard({
  children,
  className = "",
  glow = "rgba(14,133,119,0.18)",
  tilt = 4,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
  tilt?: number;
  href?: string;
}) {
  const ref = React.useRef<HTMLElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    const rx = ((y / r.height) - 0.5) * -tilt;
    const ry = ((x / r.width) - 0.5) * tilt;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const props = {
    ref,
    href,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    className: `spotlight group relative block overflow-hidden transition-transform duration-300 ease-out will-change-transform ${className}`,
    style: { "--glow": glow } as React.CSSProperties,
  };

  return React.createElement(href ? "a" : "div", props, children);
}

export default SpotlightCard;
