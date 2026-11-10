"use client";

import { createContext, useContext, type RefObject } from "react";
import type Lenis from "lenis";

/**
 * Context holds a *ref* to the Lenis instance rather than state — consumers
 * only need it inside event handlers (scroll-to on click), so it never needs
 * to trigger a re-render.
 */
export const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

/** Access the shared Lenis instance created by <SmoothScrollProvider />. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext)?.current ?? null;
}

/** Programmatic scroll-to helper that works with or without Lenis. */
export function useScrollTo() {
  const ref = useContext(LenisContext);
  return (target: string | HTMLElement, offset = 0) => {
    // On sub-pages (e.g. /work/...) the home-page section doesn't exist:
    // navigate to it on the home page instead.
    if (typeof target === "string" && target.startsWith("#") && !document.querySelector(target)) {
      window.location.assign(new URL(`/${target}`, window.location.origin).href);
      return;
    }
    const lenis = ref?.current;
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.2 });
      return;
    }
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}
