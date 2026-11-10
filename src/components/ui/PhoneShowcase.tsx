"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { ProjectImage } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const DEPTH = 14; // px thickness of the phone body

/**
 * Pinned 3D phone for case studies: the section sticks while you scroll, the
 * phone turns in 3D and flips through the app's real screens; a list beside
 * it tracks which screen is showing.
 */
export function PhoneShowcase({
  screens,
  accent,
  title,
}: {
  screens: ProjectImage[];
  accent: string;
  title: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  // Turn left → right across the scroll, with a small "flip" at each screen change.
  const rotateY = useTransform(p, (v) => {
    const per = 1 / screens.length;
    const local = (v % per) / per; // 0..1 inside the current screen
    const flip = Math.sin(local * Math.PI) * 10;
    return -28 + v * 56 + flip;
  });
  const rotateX = useTransform(p, [0, 0.5, 1], [14, 4, 12]);
  const y = useTransform(p, [0, 1], [30, -30]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(screens.length - 1, Math.floor(v * screens.length));
    setIndex((prev) => (prev === i ? prev : i));
  });

  if (reduced) return null;

  return (
    <section
      ref={ref}
      aria-label={`${title} app screens`}
      className="relative"
      style={{ height: `${Math.max(2, screens.length) * 70 + 40}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(50% 55% at 62% 55%, ${accent}2e, transparent 70%)` }}
        />
        <div className="container-page grid w-full items-center gap-5 pt-16 md:grid-cols-[1fr_1fr] md:gap-8 md:pt-0">
          {/* screen list */}
          <div className="order-2 md:order-1">
            <p className="eyebrow">
              <span className="h-px w-7" style={{ background: accent }} />
              The app, in 3D
            </p>
            <ol className="mt-3 space-y-1 md:mt-6">
              {screens.map((s, i) => (
                <li
                  key={s.src}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl px-4 py-2.5 transition-[background-color,color] duration-300",
                    i === index ? "bg-surface text-foreground shadow-[var(--card-shadow)]" : "text-faint max-md:hidden",
                  )}
                >
                  <span className="font-[family-name:var(--font-mono)] text-[0.72rem]" style={{ color: i === index ? accent : undefined }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.92rem] sm:text-[1rem]">{s.alt}</span>
                  <span className="ml-auto font-[family-name:var(--font-mono)] text-[0.7rem] text-faint md:hidden">
                    {i + 1} / {screens.length}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* 3D phone */}
          <div className="order-1 flex justify-center md:order-2" style={{ perspective: 1300 }}>
            <motion.div
              className="relative aspect-[9/19.5] h-[46svh] max-h-[560px] min-h-[280px] md:h-[52svh] md:min-h-[340px]"
              style={{ rotateY, rotateX, y, transformStyle: "preserve-3d" }}
            >
              {/* body thickness: stacked layers */}
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-[2.2rem]"
                  style={{
                    transform: `translateZ(${-(i + 1) * (DEPTH / 7)}px)`,
                    background: i === 6 ? `linear-gradient(135deg, ${accent}, #1b1530)` : "#22202c",
                  }}
                />
              ))}
              {/* front: bezel + screen */}
              <div
                className="absolute inset-0 overflow-hidden rounded-[2.2rem] border-[6px] border-[#16151c] bg-black shadow-[0_50px_100px_-30px_rgba(10,8,40,0.6)]"
                style={{ transform: "translateZ(0.5px)" }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={screens[index].src}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Image src={screens[index].src} alt={screens[index].alt} fill sizes="320px" className="object-cover object-top" />
                  </motion.div>
                </AnimatePresence>
                <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
                {/* glass reflection */}
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.18),transparent_35%)]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
