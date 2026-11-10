"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+/<>";

/**
 * Decode effect: the text resolves from random characters, left to right, the
 * first time it scrolls into view. Server HTML is the real text (SEO-safe);
 * non-Latin scripts (Hindi / Marathi) are shown as-is.
 */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || /[^\u0000-ɏ\s]/.test(text)) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let frame = 0;
        const total = text.length + 8;
        timer = window.setInterval(() => {
          frame += 1;
          const done = Math.max(0, frame - 8);
          setOut(
            text
              .split("")
              .map((ch, i) => (ch === " " || i < done ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
              .join(""),
          );
          if (frame >= total) {
            window.clearInterval(timer);
            setOut(text);
          }
        }, 34);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [text, reduced]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{out}</span>
    </span>
  );
}
