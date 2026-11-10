"use client";

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Hand } from "lucide-react";
import { projects } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHasPointer } from "@/hooks/useMediaQuery";
import { TransitionLink } from "@/components/providers/PageTransition";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

const bfs = projects.find((p) => p.id === "best-food-services")!;
const SCREENS = (bfs.gallery ?? []).filter((g) => g.portrait);

/**
 * "Tap through a real app": the Best Food Services screens inside a 3D phone.
 * Tap the right/left half (or swipe / use the arrows) to move between screens;
 * on desktop the phone tilts toward the mouse.
 */
export function AppDemo() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const phone = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const hasPointer = useHasPointer();
  const n = SCREENS.length;

  const go = (d: number) => {
    setDir(d);
    setI((v) => (v + d + n) % n);
  };

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (!hasPointer || reduced || !phone.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    phone.current.style.transform = `rotateY(${px * 18}deg) rotateX(${-py * 12}deg)`;
  };
  const untilt = () => {
    if (phone.current) phone.current.style.transform = "rotateY(-12deg) rotateX(6deg)";
  };

  if (n === 0) return null;
  const cur = SCREENS[i];

  return (
    <section id="demo" className="section relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,#16a34a_22%,transparent),transparent_65%)]" />
      <div className="container-page relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow">
            <span className="h-px w-7 bg-border-strong" />
            Live demo
          </p>
          <h2 className="t-h2 mt-4 text-foreground">
            Tap through a <span className="text-gradient-anim">real app</span> we built.
          </h2>
          <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-muted">
            These are actual screens from the Best Food Services apps — customer, vendor and delivery — live on Google Play.
          </p>

          <ol className="mt-8 hidden space-y-2 lg:block">
            {SCREENS.map((s, k) => (
              <li key={s.src}>
                <button
                  type="button"
                  onClick={() => {
                    setDir(k > i ? 1 : -1);
                    setI(k);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[0.9rem] transition-colors",
                    k === i ? "bg-[color-mix(in_oklab,#16a34a_12%,transparent)] text-foreground" : "text-muted hover:text-foreground",
                  )}
                >
                  <span className={cn("font-[family-name:var(--font-mono)] text-[0.72rem]", k === i ? "text-foreground" : "text-faint")}>
                    {String(k + 1).padStart(2, "0")}
                  </span>
                  {s.alt}
                </button>
              </li>
            ))}
          </ol>

          <TransitionLink
            href={`/work/${bfs.id}`}
            label={bfs.title}
            accent={bfs.accent}
            className="mt-8 inline-flex items-center gap-2 text-[0.9rem] font-medium text-foreground link-underline"
          >
            Read the full case study
          </TransitionLink>
        </div>

        <div className="flex flex-col items-center" onPointerMove={tilt} onPointerLeave={untilt} style={{ perspective: 1200 }} data-sound-hover>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 160, rotateY: -70, rotateX: 25, scale: 0.7 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0, rotateX: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
          <div
            ref={phone}
            className="relative transition-transform duration-500 ease-[var(--ease)] [transform-style:preserve-3d]"
            style={{ transform: reduced ? undefined : "rotateY(-12deg) rotateX(6deg)" }}
          >
            {/* phone body */}
            <div className="relative aspect-[9/19.5] w-[min(72vw,290px)] rounded-[44px] border-[10px] border-[#14141a] bg-black shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6),0_0_0_2px_#2a2a33] dark:shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9),0_0_0_2px_#3a3a46]">
              <span aria-hidden className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#14141a]" />
              <div className="relative h-full w-full overflow-hidden rounded-[34px]">
                <AnimatePresence initial={false} custom={dir}>
                  <motion.div
                    key={cur.src}
                    custom={dir}
                    className="absolute inset-0"
                    initial={reduced ? false : { x: `${dir * 100}%` }}
                    animate={{ x: "0%" }}
                    exit={reduced ? undefined : { x: `${dir * -35}%`, opacity: 0.4 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.3}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 50) sound.play("swipe");
                      if (info.offset.x < -50) go(1);
                      else if (info.offset.x > 50) go(-1);
                    }}
                  >
                    <Image src={cur.src} alt={cur.alt} fill sizes="290px" className="pointer-events-none select-none object-cover object-top" draggable={false} />
                  </motion.div>
                </AnimatePresence>
                {/* tap zones */}
                <button type="button" aria-label="Previous screen" onClick={() => go(-1)} className="absolute inset-y-0 left-0 z-10 w-1/3" />
                <button type="button" aria-label="Next screen" onClick={() => go(1)} className="absolute inset-y-0 right-0 z-10 w-1/3" />
              </div>
            </div>
            {/* glossy reflection */}
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[44px] bg-[linear-gradient(115deg,rgba(255,255,255,0.18),transparent_35%)]" />
          </div>
          </motion.div>

          <div className="mt-8 flex items-center gap-4">
            <button type="button" aria-label="Previous screen" onClick={() => go(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-border-strong text-foreground transition-colors hover:bg-[rgba(var(--ink-rgb),0.06)]">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-1.5">
              {SCREENS.map((s, k) => (
                <span key={s.src} className={cn("h-1.5 rounded-full transition-all duration-300", k === i ? "w-6 bg-[#16a34a]" : "w-1.5 bg-border-strong")} />
              ))}
            </div>
            <button type="button" aria-label="Next screen" onClick={() => go(1)} className="grid h-11 w-11 place-items-center rounded-full border border-border-strong text-foreground transition-colors hover:bg-[rgba(var(--ink-rgb),0.06)]">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[0.78rem] text-faint">
            <Hand className="h-3.5 w-3.5" /> Tap the sides of the screen or swipe
          </p>
        </div>
      </div>
    </section>
  );
}
