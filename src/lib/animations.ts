import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Register GSAP plugins exactly once (client only). */
export function registerGsap() {
  if (registered || typeof window === "undefined") return { gsap, ScrollTrigger };
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  registered = true;
  return { gsap, ScrollTrigger };
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Reveal a set of targets on scroll with a staggered rise + fade.
 * Returns a cleanup function. No-op (but still shows content) when reduced motion is on.
 */
export function revealOnScroll(
  targets: gsap.TweenTarget,
  options: {
    trigger?: Element | null;
    y?: number;
    stagger?: number;
    start?: string;
    duration?: number;
  } = {},
) {
  const { gsap: g } = registerGsap();
  const {
    trigger,
    y = 40,
    stagger = 0.08,
    start = "top 82%",
    duration = 0.9,
  } = options;

  if (prefersReducedMotion()) {
    g.set(targets, { opacity: 1, y: 0 });
    return () => {};
  }

  const ctx = g.context(() => {
    g.from(targets, {
      opacity: 0,
      y,
      duration,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: trigger ?? (targets as Element),
        start,
      },
    });
  });

  return () => ctx.revert();
}
