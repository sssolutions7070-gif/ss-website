"use client";

import { useEffect, useRef } from "react";
import { sound } from "@/lib/sound";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const WORDS = ["Websites", "Mobile Apps", "AI Agents", "Automation", "E-commerce", "Games", "Web3"];

/** One row of giant text that drifts, speeds up with scroll and leans into it. */
function Row({ dir, outline }: { dir: 1 | -1; outline?: boolean }) {
  const reduced = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-2500, 0, 2500], [-5, 0, 5], { clamp: false });
  const skew = useTransform(velocity, [-2500, 2500], [8 * dir, -8 * dir]);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(dir);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const b = boost.get();
    if (b < 0) direction.current = (-dir as 1 | -1);
    else if (b > 0) direction.current = dir;
    const move = direction.current * 2.2 * (delta / 1000) * (1 + Math.abs(b));
    base.set(base.get() + move);
  });

  const words = [...WORDS, ...WORDS];
  return (
    <div className="overflow-hidden" aria-hidden>
      <motion.div style={{ x, skewX: reduced ? 0 : skew }} className="flex w-max whitespace-nowrap will-change-transform">
        {[0, 1].map((rep) => (
          <div key={rep} aria-hidden={rep === 1} className="flex shrink-0 items-center">
            {words.map((w, i) => (
              <span key={`${w}-${i}`} className="flex items-center">
                <span
                  className={
                    "px-5 font-display text-[clamp(2.6rem,1.6rem+5vw,6.5rem)] font-bold leading-[1.05] tracking-[-0.04em] " +
                    (outline
                      ? "text-transparent [-webkit-text-stroke:1.5px_var(--border-strong)]"
                      : "bg-[linear-gradient(100deg,var(--foreground),var(--purple)_55%,var(--blue))] bg-clip-text text-transparent")
                  }
                >
                  {w}
                </span>
                <span className="text-[clamp(1.4rem,1rem+2vw,2.8rem)] text-purple">✦</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/** Kinetic typography band between sections. */
export function VelocityBand() {
  // sound: rushing air that follows scroll speed — only while this band is on screen
  const ref = useRef<HTMLElement>(null);
  const visible = useRef(false);
  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  const quiet = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      if (!e.isIntersecting) sound.wind(0);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      sound.wind(0);
      window.clearTimeout(quiet.current);
    };
  }, []);
  useMotionValueEvent(vel, "change", (v) => {
    if (!visible.current) return;
    sound.wind(Math.min(1, Math.abs(v) / 2600));
    // fade out shortly after scrolling stops
    window.clearTimeout(quiet.current);
    quiet.current = window.setTimeout(() => sound.wind(0), 140);
  });

  return (
    <section ref={ref} aria-label="What we build" className="relative overflow-hidden border-y border-border py-8 md:py-12">
      {/* the moving words are decorative; screen readers get them once, as text */}
      <p className="sr-only">{WORDS.join(", ")}</p>
      <Row dir={-1} />
      <Row dir={1} outline />
    </section>
  );
}
