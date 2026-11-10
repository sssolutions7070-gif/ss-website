"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { sound } from "@/lib/sound";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import { projectImages } from "@/components/ui/ProjectCard";
import { TransitionLink } from "@/components/providers/PageTransition";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const IDS = ["best-food-services", "drivebloc", "vishwaguru-gaushala", "dreamrole", "rag-agent"];
const SLIDES = IDS.map((id) => projects.find((p) => p.id === id)).filter((p): p is (typeof projects)[number] => !!p);

function Slide({ p, i }: { p: (typeof SLIDES)[number]; i: number }) {
  const img = projectImages(p)[0];
  const accent = p.accent ?? "#6a46ff";
  return (
    <TransitionLink
      href={`/work/${p.id}`}
      label={p.title}
      accent={accent}
      image={img.src}
      className="group relative flex h-full w-[86vw] shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border border-border bg-surface shadow-[var(--card-shadow)] sm:w-[70vw] lg:w-[min(62vw,980px)]"
    >
      <div
        data-pt-from
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ background: `radial-gradient(100% 90% at 50% 0%, ${accent}38, transparent 70%)` }}
      >
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(max-width: 1024px) 86vw, 980px"
          className={`transition-transform duration-[1.2s] ease-[var(--ease)] group-hover:scale-[1.04] ${
            img.portrait ? "object-contain p-6" : "object-cover object-top"
          }`}
        />
        <span className="absolute left-5 top-5 rounded-full bg-black/55 px-3 py-1 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.16em] text-white backdrop-blur">
          {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>
      <div className="flex items-end justify-between gap-6 border-t border-border p-5 sm:p-7">
        <div className="min-w-0">
          <p className="t-label flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
            {p.category}
          </p>
          <h3 className="mt-2 truncate font-display text-[clamp(1.3rem,1rem+1.4vw,2.2rem)] font-semibold tracking-[-0.03em] text-foreground">
            {p.title}
          </h3>
        </div>
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-white transition-transform duration-500 ease-[var(--ease)] group-hover:rotate-45"
          style={{ background: accent }}
        >
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
    </TransitionLink>
  );
}

/**
 * "Selected work": on desktop the section pins and the projects slide
 * sideways as you scroll down. On phones / reduced motion it's a native
 * swipeable row with snap points.
 */
export function FeaturedReel() {
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const pinned = wide && !reduced;
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (!pinned || !track.current) return;
    const el = track.current;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  // soft tick each time the next project slides into place
  const slideIdx = useRef(0);
  useMotionValueEvent(bar, "change", (v) => {
    if (!pinned) return;
    const i = Math.round(v * (SLIDES.length - 1));
    if (i !== slideIdx.current) {
      slideIdx.current = i;
      sound.play("ratchet");
    }
  });

  const header = (
    <div className="container-page flex items-end justify-between gap-6">
      <div>
        <p className="eyebrow">
          <span className="h-px w-7 bg-border-strong" />
          Selected work
        </p>
        <h2 className="t-h2 mt-4 text-foreground">
          Featured <span className="text-gradient-anim">projects</span>
        </h2>
      </div>
      <p className="hidden max-w-xs text-[0.9rem] text-muted md:block">
        {pinned ? "Keep scrolling — the work slides past." : "Swipe to see more."}
      </p>
    </div>
  );

  if (!pinned) {
    return (
      <section ref={section} aria-label="Featured projects" className="section relative">
        {header}
        <div className="mt-10 flex h-[min(78svh,560px)] snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none]">
          {SLIDES.map((p, i) => (
            <Slide key={p.id} p={p} i={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={section}
      aria-label="Featured projects"
      className="relative"
      style={{ height: `${SLIDES.length * 70 + 60}vh` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center gap-10 overflow-hidden pt-20">
        {header}
        <motion.div ref={track} style={{ x }} className="flex h-[min(64svh,620px)] gap-6 pl-[var(--gutter)] pr-[12vw] will-change-transform">
          {SLIDES.map((p, i) => (
            <Slide key={p.id} p={p} i={i} />
          ))}
        </motion.div>
        <div className="container-page">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-border">
            <motion.div style={{ scaleX: bar }} className="h-full origin-left rounded-full bg-[linear-gradient(90deg,var(--purple),var(--blue),#c026d3)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
