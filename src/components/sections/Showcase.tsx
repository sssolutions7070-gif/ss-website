"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { TextLink } from "@/components/ui/TextLink";
import { SceneMount } from "@/components/three/SceneMount";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

const DeviceShowcase = dynamic(
  () =>
    import("@/components/three/DeviceShowcase").then((m) => {
      m.preloadShowcase(DEVICE_STAGES);
      return m.DeviceShowcase;
    }),
  { ssr: false },
);

const STAGES = [
  {
    kicker: "Web + 3 Android apps",
    title: "Platforms that run a whole business",
    body: "Best Food Services — a customer website plus Customer, Vendor and Delivery apps for food, grocery, pharmacy, parcels and rides across 25+ zones.",
    laptop: "/work/bfs/website.png",
    phone: "/work/bfs/app-1.png",
  },
  {
    kicker: "Marketplace + native app",
    title: "Marketplaces that bring people together",
    body: "DriveBloc — group car buying for Maharashtra, with a fast website, a native Android app and an admin panel that runs every deal.",
    laptop: "/work/drivebloc/website.png",
    phone: "/work/drivebloc/screenshot-2-groups.png",
  },
  {
    kicker: "AI products + games",
    title: "AI systems and apps people enjoy",
    body: "DreamRole matches candidates to jobs from their resume with proctored tests; FlowShift and Neon Escape are polished Android games.",
    laptop: "/work/dreamrole/jobs.png",
    phone: "/work/flowshift/play.png",
  },
];

const DEVICE_STAGES = STAGES.map(({ laptop, phone }) => ({ laptop, phone }));

/**
 * Pinned 3D showcase: the section is tall, its content sticks to the viewport,
 * and scroll progress drives the devices and the caption.
 */
export function Showcase() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = v;
    const u = Math.min(1, Math.max(0, (v - 0.1) / 0.9)) * STAGES.length;
    const s = Math.min(STAGES.length - 1, Math.floor(u));
    setStage((prev) => {
      if (prev !== s) sound.play("screen");
      return prev === s ? prev : s;
    });
  });

  if (reduced) return <StaticShowcase />;

  const current = STAGES[stage];

  return (
    <section ref={ref} id="showcase" aria-label="Featured work in 3D" className="relative h-[340vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* soft stage light */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_55%_at_70%_55%,color-mix(in_oklab,var(--purple)_16%,transparent),transparent_70%)]"
        />

        {/* 3D devices */}
        <SceneMount
          className="absolute inset-x-0 top-[64px] h-[50svh] sm:h-[56svh] lg:inset-y-0 lg:left-[36%] lg:right-0 lg:top-0 lg:h-full [@media(orientation:landscape)_and_(max-height:540px)]:left-[44%] [@media(orientation:landscape)_and_(max-height:540px)]:top-[64px] [@media(orientation:landscape)_and_(max-height:540px)]:h-[calc(100svh-64px)]"
          camera={{ position: [0, 1.7, 7.6], fov: 36 }}
          rootMargin="120% 0px"
        >
          <DeviceShowcase stages={DEVICE_STAGES} progress={progress} />
        </SceneMount>

        {/* captions */}
        <div className="container-page relative flex h-full flex-col justify-end pb-24 sm:pb-20 lg:justify-center lg:pb-0 [@media(orientation:landscape)_and_(max-height:540px)]:justify-center [@media(orientation:landscape)_and_(max-height:540px)]:pb-0 [@media(orientation:landscape)_and_(max-height:540px)]:pt-16">
          <div className="max-w-[30rem] lg:max-w-[26rem] xl:max-w-[30rem] [@media(orientation:landscape)_and_(max-height:540px)]:max-w-[42%]">
            <p className="eyebrow [@media(orientation:landscape)_and_(max-height:540px)]:hidden">
              <span className="h-px w-7 bg-purple" />
              Featured work
            </p>

            <div className="relative mt-4 min-h-[11.5rem] sm:min-h-[12.5rem] lg:mt-6 lg:min-h-[17rem] [@media(orientation:landscape)_and_(max-height:540px)]:mt-2 [@media(orientation:landscape)_and_(max-height:540px)]:min-h-[9rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="t-label">{current.kicker}</span>
                  <h2 className="mt-3 font-display text-[clamp(1.6rem,1.1rem+2.4vw,3rem)] [@media(orientation:landscape)_and_(max-height:540px)]:text-[1.35rem] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
                    {current.title}
                  </h2>
                  <p className="mt-4 text-[0.92rem] leading-relaxed text-muted sm:text-[0.98rem] [@media(orientation:landscape)_and_(max-height:540px)]:mt-2 [@media(orientation:landscape)_and_(max-height:540px)]:line-clamp-3 [@media(orientation:landscape)_and_(max-height:540px)]:text-[0.82rem]">
                    {current.body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <ol className="mt-4 flex gap-2 lg:mt-8" aria-label="Showcase progress">
              {STAGES.map((s, i) => (
                <li key={s.kicker} className="flex-1">
                  <span
                    className={cn(
                      "block font-[family-name:var(--font-mono)] text-[0.66rem] transition-colors",
                      i === stage ? "text-foreground" : "text-faint",
                    )}
                  >
                    0{i + 1}
                  </span>
                  <span className="mt-2 block h-[3px] overflow-hidden rounded-full bg-border">
                    <span
                      className={cn(
                        "block h-full rounded-full bg-purple transition-[width] duration-500 ease-[var(--ease)]",
                        i < stage ? "w-full" : i === stage ? "w-2/3" : "w-0",
                      )}
                    />
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-6 hidden sm:block lg:mt-10 [@media(orientation:landscape)_and_(max-height:540px)]:hidden">
              <TextLink href="#work">Explore all projects</TextLink>
            </div>
          </div>
        </div>

        <motion.div
          aria-hidden
          style={{ scaleX: bar }}
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[linear-gradient(90deg,var(--purple),var(--blue))]"
        />
      </div>
    </section>
  );
}

/** Reduced-motion version: the same story as three still rows. */
function StaticShowcase() {
  return (
    <section id="showcase" aria-label="Featured work" className="section">
      <div className="container-page grid gap-12">
        {STAGES.map((s) => (
          <div key={s.kicker} className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
            <div>
              <span className="t-label">{s.kicker}</span>
              <h2 className="t-h3 mt-3 text-foreground">{s.title}</h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{s.body}</p>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-border">
              <Image src={s.laptop} alt={s.title} fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover object-top" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
