"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Tag = "div" | "section" | "li" | "span";

const MOTION_TAG = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  span: motion.span,
} as const;

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in seconds before this element animates in. */
  delay?: number;
  /** Travel distance in px. */
  y?: number;
  as?: Tag;
  once?: boolean;
}

/**
 * Lightweight in-view reveal. Respects reduced-motion (renders static).
 * Use for content blocks; use <AnimatedHeading /> for word-by-word text.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 32,
  as = "div",
  once = true,
}: ScrollRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = MOTION_TAG[as] as typeof motion.div;

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "0px 0px -12% 0px" }}
    >
      {children}
    </MotionTag>
  );
}
