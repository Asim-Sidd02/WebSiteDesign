"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SignLoader from "@/components/sign-loader";

export default function SiteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const previousPath = useRef(pathname);

  useEffect(() => {
    const content = document.getElementById("site-content");
    if (!content) return;
    content.inert = visible;
    if (visible) content.setAttribute("aria-hidden", "true");
    else content.removeAttribute("aria-hidden");
  }, [visible]);

  useEffect(() => {
    const startedAt = performance.now();
    let hideTimer = 0;
    const hideWhenReady = () => {
      const remaining = Math.max(0, 1500 - (performance.now() - startedAt));
      hideTimer = window.setTimeout(() => setVisible(false), remaining);
    };
    if (document.readyState === "complete") hideWhenReady();
    else window.addEventListener("load", hideWhenReady, { once: true });
    const safetyTimer = window.setTimeout(() => setVisible(false), 10000);

    const onInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement) || target.target === "_blank" || target.hasAttribute("download")) return;
      const destination = new URL(target.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      setVisible(true);
    };
    document.addEventListener("click", onInternalNavigation, true);

    return () => {
      window.removeEventListener("load", hideWhenReady);
      window.clearTimeout(hideTimer);
      window.clearTimeout(safetyTimer);
      document.removeEventListener("click", onInternalNavigation, true);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    setVisible(true);
    const hideTimer = window.setTimeout(() => setVisible(false), 650);
    return () => window.clearTimeout(hideTimer);
  }, [pathname]);

  return visible ? <SignLoader /> : null;
}
