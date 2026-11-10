"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Two door panels (page-coloured) cover the top of a section and slide apart
 * as it scrolls in, revealing it. Put inside a `relative` section.
 */
export function DoorReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.25"] });
  const left = useTransform(scrollYProgress, [0, 1], ["0%", "-101%"]);
  const right = useTransform(scrollYProgress, [0, 1], ["0%", "101%"]);
  const seam = useTransform(scrollYProgress, [0, 0.15, 0.6], [0, 1, 0]);
  if (reduced) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[min(70vh,640px)] overflow-hidden rounded-[inherit]">
      <motion.div style={{ x: left }} className="absolute inset-y-0 left-0 w-1/2 bg-background shadow-[20px_0_40px_-20px_rgba(var(--ink-rgb),0.25)]" />
      <motion.div style={{ x: right }} className="absolute inset-y-0 right-0 w-1/2 bg-background shadow-[-20px_0_40px_-20px_rgba(var(--ink-rgb),0.25)]" />
      <motion.span style={{ opacity: seam }} className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-[linear-gradient(180deg,transparent,var(--purple),transparent)] shadow-[0_0_24px_6px_var(--glow)]" />
    </div>
  );
}
