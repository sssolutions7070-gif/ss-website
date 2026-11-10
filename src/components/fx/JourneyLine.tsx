"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * A thin gradient path down the right edge of the whole home page that draws
 * itself as you scroll — the journey from hero to contact. Large screens only.
 */
export function JourneyLine() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const draw = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-3 z-[1] hidden w-10 xl:block">
      <svg className="h-full w-full" viewBox="0 0 40 1000" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id="journey" x1="0" y1="0" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6a46ff" />
            <stop offset="0.35" stopColor="#3d63ff" />
            <stop offset="0.65" stopColor="#c026d3" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path
          d="M20 0 C 36 60, 4 120, 20 180 S 36 300, 20 360 S 4 480, 20 540 S 36 660, 20 720 S 4 840, 20 900 S 30 970, 20 1000"
          stroke="rgba(var(--ink-rgb),0.07)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d="M20 0 C 36 60, 4 120, 20 180 S 36 300, 20 360 S 4 480, 20 540 S 36 660, 20 720 S 4 840, 20 900 S 30 970, 20 1000"
          stroke="url(#journey)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: draw }}
        />
      </svg>
    </div>
  );
}
