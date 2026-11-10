"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { sound } from "@/lib/sound";

/**
 * Curtain reveal: the footer content sits fixed at the bottom of the viewport
 * and is clipped to this wrapper, so it appears to be uncovered from behind
 * the page as you scroll. Falls back to normal flow when the content is taller
 * than ~85% of the viewport or motion is reduced.
 */
export function FooterReveal({ children, className }: { children: ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [h, setH] = useState<number | null>(null);

  useEffect(() => {
    const el = inner.current;
    if (!el || reduced) return;
    const measure = () => {
      const height = el.offsetHeight;
      setH(height <= window.innerHeight * 0.85 ? height : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduced]);

  // sound: curtain sweep as the footer is uncovered
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && sound.play("curtain"), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const active = h !== null && !reduced;
  return (
    <div
      ref={wrap}
      className="relative"
      style={active ? { height: h, clipPath: "inset(0 0 0 0)" } : undefined}
    >
      <div
        ref={inner}
        className={className}
        style={active ? { position: "fixed", left: 0, right: 0, bottom: 0 } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
