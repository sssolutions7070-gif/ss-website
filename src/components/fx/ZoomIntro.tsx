"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * A full-screen project image that shrinks into a rounded card as you scroll
 * down into the projects — a cinematic hand-off into "Featured projects".
 */
export function ZoomIntro() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 0.85], [1, 0.62]);
  const radius = useTransform(scrollYProgress, [0, 0.5], [0, 36]);
  const titleY = useTransform(scrollYProgress, [0, 0.55], ["8%", "-25%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.06, 0.38, 0.55], [0, 1, 1, 0]);
  const shade = useTransform(scrollYProgress, [0, 0.45, 0.8], [0.78, 0.7, 0.08]);

  if (reduced) return null;
  return (
    <section ref={ref} aria-label="Our work" className="relative h-[200vh]">
      <div className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden">
        <motion.div style={{ scale, borderRadius: radius }} className="relative h-[100svh] w-full overflow-hidden will-change-transform">
          <Image src="/work/drivebloc/website.png" alt="" fill sizes="100vw" className="object-cover object-top" />
          <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-[#0b0920]" />
        </motion.div>
        <motion.div style={{ y: titleY, opacity: titleOpacity }} className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[0.78rem] uppercase tracking-[0.3em] text-white/80">Selected work</p>
            <p className="mt-4 font-display text-[clamp(2.6rem,1.5rem+5vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-white [text-shadow:0_10px_40px_rgba(0,0,0,0.4)]">
              Real products.
              <br />
              Real businesses.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
