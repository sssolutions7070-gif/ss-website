"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { sound } from "@/lib/sound";
import { useRef } from "react";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TextLink } from "@/components/ui/TextLink";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useT } from "@/i18n/LanguageProvider";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Smartphone, MapPin, Rocket, Sparkles } from "lucide-react";
import { projects } from "@/data/projects";
import { HeroSparks, ScrollHint, Typewriter } from "@/components/fx/HeroFx";
import { Scramble } from "@/components/fx/Scramble";

/** Floating proof chips over the 3D scene (desktop only, real facts only). */
const CHIPS = [
  { icon: Rocket, text: `${projects.length} projects delivered`, color: "#6a46ff", pos: "right-[30%] top-[24%]", delay: "0s" },
  { icon: Smartphone, text: "3 apps live on Google Play", color: "#16a34a", pos: "right-[6%] top-[42%]", delay: "-2.5s" },
  { icon: Sparkles, text: "Web · Mobile · AI · Web3", color: "#c026d3", pos: "right-[24%] bottom-[22%]", delay: "-4.5s" },
  { icon: MapPin, text: "Based in Pune, India", color: "#3d63ff", pos: "right-[4%] bottom-[12%]", delay: "-1.2s" },
];

const PILLARS = [
  "Web",
  "Mobile",
  "Software",
  "Automation",
  "Marketing",
  "Consultancy",
];

/**
 * Mount reveal done in CSS (see .hero-rise in globals.css) so the hero text is
 * painted immediately — it doesn't wait for JavaScript. Reduced motion → no animation.
 */
function Reveal({
  i,
  children,
  className,
}: {
  i: number;
  children: ReactNode;
  className?: string;
  reduced?: boolean;
}) {
  return (
    <div className={cn("hero-rise", className)} style={{ "--d": `${0.15 + i * 0.09}s` } as CSSProperties}>
      {children}
    </div>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const { t, lang } = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  // the whole hero shrinks and tips back as the next section slides over it
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const stageTilt = useTransform(scrollYProgress, [0, 1], [0, 7]);
  const stageRadius = useTransform(scrollYProgress, [0, 0.4], [0, 40]);

  // sound: a magnetic hum swells while the mouse steers the 3D mark, fades when it stops
  const lastMove = useRef({ x: 0, y: 0, t: 0 });
  const humOff = useRef(0);
  const onHeroMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const now = performance.now();
    const l = lastMove.current;
    const speed = Math.hypot(e.clientX - l.x, e.clientY - l.y) / Math.max(1, now - l.t); // px/ms
    lastMove.current = { x: e.clientX, y: e.clientY, t: now };
    sound.loop("hum", Math.min(1, speed / 1.6));
    // #3 parallax: chips drift toward the mouse at different depths
    const host = e.currentTarget as HTMLElement;
    const r = host.getBoundingClientRect();
    host.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    host.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    window.clearTimeout(humOff.current);
    humOff.current = window.setTimeout(() => sound.loop("hum", 0), 180);
  };

  // sound: the hero "lifts off" as it tilts away, and "lands" when you return to the top
  const lifted = useRef(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!lifted.current && v > 0.22) {
      lifted.current = true;
      sound.play("liftoff");
    } else if (lifted.current && v < 0.04) {
      lifted.current = false;
      sound.play("land");
    }
  });

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative [perspective:1400px]"
      onPointerMove={onHeroMove}
      onPointerLeave={() => sound.loop("hum", 0)}
      onClick={(e) => {
        // #1 clicking empty hero space pokes the 3D "S": it spins once with a ripple
        if ((e.target as Element).closest("a, button")) return;
        window.dispatchEvent(new Event("ss:hero-poke"));
        sound.play("open");
      }}
    >
    <motion.div
      className="relative flex min-h-[100svh] origin-top flex-col justify-center overflow-hidden pt-32 pb-24 md:pt-36"
      style={reduced || isMobile ? undefined : { scale: stageScale, rotateX: stageTilt, borderRadius: stageRadius }}
    >
      <HeroCanvas />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(105deg,var(--background)_16%,color-mix(in_oklab,var(--background)_55%,transparent)_50%,transparent_82%)] md:bg-[linear-gradient(100deg,var(--background)_28%,color-mix(in_oklab,var(--background)_40%,transparent)_60%,transparent_88%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-[5] h-40 bg-[linear-gradient(to_top,var(--background),transparent)]"
      />

      <HeroSparks />
      <ScrollHint />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
        {CHIPS.map((c, i) => (
          <Reveal key={c.text} i={7 + i} reduced={reduced} className={`absolute ${c.pos}`}>
            <span
              className="hero-parallax block"
              style={{ "--depth": `${18 + i * 10}px` } as CSSProperties}
            >
            <span
              className="hero-chip inline-flex items-center gap-2.5 rounded-2xl border border-border bg-surface/95 px-3.5 py-2.5 text-[0.82rem] font-medium text-foreground shadow-[0_18px_40px_-20px_rgba(var(--ink-rgb),0.45)]"
              style={{ animationDelay: c.delay }}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg text-white" style={{ background: c.color }}>
                <c.icon className="h-3.5 w-3.5" />
              </span>
              {c.text}
            </span>
            </span>
          </Reveal>
        ))}
      </div>

      <motion.div
        className="container-page relative"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-[46rem]">
          <Reveal i={0} reduced={reduced} className="eyebrow">
            <span className="h-px w-7 bg-border-strong" />
            <Scramble text={t("hero.eyebrow")} />
          </Reveal>

          <div className="mt-6">
            <AnimatedHeading
              as="h1"
              trigger="mount"
              key={lang}
              text={t("hero.title")}
              className="hero-title t-display text-foreground"
              stagger={0.09}
              highlightFrom={2}
              delay={0.12}
            />
          </div>

          {lang === "en" && (
            <Reveal i={3} className="mt-6 font-[family-name:var(--font-mono)] text-[0.95rem] text-muted-strong">
              <Typewriter />
            </Reveal>
          )}

          <Reveal
            i={4}
            reduced={reduced}
            className="t-lead mt-7 max-w-[34rem] text-muted-strong"
          >
            {t("hero.lead")}
          </Reveal>

          <Reveal
            i={5}
            reduced={reduced}
            className="mt-9 flex flex-col items-start gap-x-7 gap-y-4 sm:flex-row sm:items-center"
          >
            <MagneticButton href="#contact" size="lg">
              {t("cta.startLower")}
            </MagneticButton>
            <TextLink href="#work">{t("cta.seeProjects")}</TextLink>
          </Reveal>

          <Reveal
            i={6}
            reduced={reduced}
            className="mt-14 hidden flex-wrap gap-x-3 sm:flex gap-y-2 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.18em] text-faint"
          >
            {PILLARS.map((p, i) => (
              <span key={p} className="flex items-center gap-3">
                {i > 0 && <span className="text-border-strong">/</span>}
                {p}
              </span>
            ))}
          </Reveal>
        </div>
      </motion.div>
    </motion.div>
    </section>
  );
}
