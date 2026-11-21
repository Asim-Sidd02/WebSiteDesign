/** Scroll to an element (or the top), clearing the fixed navbar, via Lenis when it's running. */
export function scrollToTarget(target: string | number) {
  type L = { scrollTo: (t: HTMLElement | number, o?: { offset?: number }) => void };
  const lenis = (window as unknown as { __lenis?: L }).__lenis;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof target === "number") {
    if (lenis) lenis.scrollTo(target);
    else window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
    return;
  }
  const el = document.getElementById(target);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -88 });
  else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  // Move focus for keyboard and screen-reader users without a second jump.
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
