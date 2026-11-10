"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

type HeadingTag = "h1" | "h2" | "h3" | "p" | "div";

const MOTION_TAG = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  div: motion.div,
} as const;

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  as?: HeadingTag;
  id?: string;
  /** "inView" (default) plays on scroll-in; "mount" plays immediately (use for the hero / LCP). */
  trigger?: "inView" | "mount";
  /** Stagger between lines, seconds. */
  stagger?: number;
  delay?: number;
  /** Lines from this index on get the animated brand gradient. */
  highlightFrom?: number;
  /** "lines" (default) or "chars" — letters rise one by one. */
  split?: "lines" | "chars";
}

/**
 * Cinematic heading: each line rises from behind a clip mask, once.
 * Line-level (not word-level) — calmer, more editorial.
 * Accessible: the real text is on `aria-label`; the animated fragments are
 * decorative. Renders static, fully visible under reduced-motion.
 */
export function AnimatedHeading({
  text,
  className,
  as = "h2",
  id,
  trigger = "inView",
  stagger = 0.09,
  delay = 0,
  highlightFrom,
  split = "lines",
}: AnimatedHeadingProps) {
  const hl = (i: number) => (highlightFrom !== undefined && i >= highlightFrom ? "text-gradient-anim" : "");
  const reduced = useReducedMotion();
  const lines = text.split("\n");
  // Devanagari (Hindi / Marathi) letters join into conjuncts — never split them per letter.
  const mode = split === "chars" && /[ऀ-ॿ]/.test(text) ? "lines" : split;

  if (reduced) {
    const Tag = as;
    return (
      <Tag id={id} className={className}>
        {lines.map((line, i) => (
          <span key={i} className={cn("block", hl(i))}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  // Above-the-fold headings: pure CSS line reveal — painted before JS loads (fast LCP).
  if (trigger === "mount" && mode === "lines") {
    const Tag = as;
    return (
      <Tag id={id} aria-label={text.replace(/\n/g, " ")} className={className}>
        {lines.map((line, i) => (
          <span key={i} aria-hidden className="block overflow-hidden pb-[0.08em] [clip-path:inset(-30%_-30%_0_-30%)]">
            <span className={cn("line-rise block", hl(i))} style={{ "--d": `${delay + i * stagger}s` } as CSSProperties}>
              {line || " "}
            </span>
          </span>
        ))}
      </Tag>
    );
  }

  const MotionTag = MOTION_TAG[as] as typeof motion.h2;
  const activate =
    trigger === "mount"
      ? { animate: "visible" as const }
      : {
          whileInView: "visible" as const,
          viewport: { once: true, margin: "0px 0px -12% 0px" },
        };

  return (
    <MotionTag
      id={id}
      aria-label={text.replace(/\n/g, " ")}
      className={cn(className)}
      initial="hidden"
      {...activate}
      transition={{ staggerChildren: mode === "chars" ? Math.min(stagger, 0.035) : stagger, delayChildren: delay }}
    >
      {mode === "chars" &&
        lines.map((line, i) => (
          <span key={i} aria-hidden className="block overflow-hidden pb-[0.08em] [clip-path:inset(-30%_-30%_0_-30%)]">
            {Array.from(line || " ").map((ch, j) => (
              <motion.span
                key={j}
                className={cn("inline-block will-change-transform", hl(i))}
                // offset the shimmer per letter so the gradient flows across the word
                style={hl(i) ? { animationDelay: `${-j * 0.35}s` } : undefined}
                variants={{
                  hidden: { y: "115%", rotate: 8 },
                  visible: {
                    y: 0,
                    rotate: 0,
                    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                {ch === " " ? " " : ch}
              </motion.span>
            ))}
          </span>
        ))}
      {mode === "lines" && lines.map((line, i) => (
        <span
          key={i}
          aria-hidden
          className="block overflow-hidden pb-[0.08em] [clip-path:inset(-30%_-30%_0_-30%)]"
        >
          <motion.span
            className={cn("block will-change-transform", hl(i))}
            variants={{
              hidden: { y: "112%" },
              visible: {
                y: 0,
                transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {line || " "}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
