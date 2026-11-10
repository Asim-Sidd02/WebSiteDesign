"use client";
import React from "react";
import Image from "next/image";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

const NAV_MENU = [
  { name: "Features", sectionId: "features" },
  { name: "Use Cases", sectionId: "use-case" },
  { name: "FAQs", sectionId: "faq" },
];

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => window.innerWidth >= 960 && setOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-gray-200 bg-white/85 py-2 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent py-4"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between px-6">
        <a href="#" className="flex items-center gap-3">
          <Image src="/image/signsense.png" alt="SignSense logo" width={44} height={44} />
          <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>SignSense</span>
        </a>

        <ul className={`hidden items-center gap-1 rounded-full border p-1 backdrop-blur transition-colors lg:flex ${scrolled ? "border-gray-200 bg-gray-50" : "border-white/10 bg-white/5"}`}>
          {NAV_MENU.map(({ name, sectionId }) => (
            <li key={name}>
              <button
                onClick={() => go(sectionId)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300 ${scrolled ? "text-gray-600 hover:bg-white hover:text-brand-500" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <a href="#" className={`px-4 text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/70 hover:text-white"}`}>
            Log in
          </a>
          <a href="#" className="btn-primary !px-5 !py-2.5">
            Get Started
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`rounded-lg p-2 lg:hidden ${scrolled ? "text-gray-900" : "text-white"}`}
          aria-label="Toggle menu"
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </nav>

      <div
        className={`grid overflow-hidden px-6 transition-all duration-500 lg:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
            <ul className="flex flex-col gap-1">
              {NAV_MENU.map(({ name, sectionId }) => (
                <li key={name}>
                  <button
                    onClick={() => go(sectionId)}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-3">
              <a href="#" className="inline-flex items-center rounded-full border border-gray-300 px-7 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">Log in</a>
              <a href="#" className="btn-primary !py-2.5">Get Started</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
