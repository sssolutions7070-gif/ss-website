"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { LenisContext } from "@/hooks/useLenis";
import { registerGsap, prefersReducedMotion } from "@/lib/animations";

/**
 * Smooth scrolling (Lenis) wired into GSAP ScrollTrigger.
 * - Disabled entirely when the user prefers reduced motion.
 * - Drives Lenis from GSAP's ticker so animations and scroll never desync.
 * - The instance lives in a ref (see useLenis) so this never re-renders.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const { gsap, ScrollTrigger } = registerGsap();

    const instance = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = instance;

    instance.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Recalculate trigger positions once layout + fonts settle.
    const timeoutId = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(onTick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
}
