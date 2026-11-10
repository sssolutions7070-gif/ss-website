"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { sound } from "@/lib/sound";
import { Check, Compass, Layers, PenTool, Code2, TrendingUp, type LucideIcon } from "lucide-react";
import { processSteps } from "@/data/process";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ProcessStep } from "@/types";

const ICONS: LucideIcon[] = [Compass, Layers, PenTool, Code2, TrendingUp];
const ACCENTS = ["#6a46ff", "#3d63ff", "#c026d3", "#0ea5e9", "#16a34a"];

function StepCard({
  step,
  i,
  total,
  progress,
  reduced,
}: {
  step: ProcessStep;
  i: number;
  total: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  // Each card shrinks a little as the cards after it stack on top.
  const targetScale = 1 - (total - 1 - i) * 0.045;
  const scale = useTransform(progress, [i / total, 1], [1, targetScale]);
  const Icon = ICONS[i % ICONS.length];
  const accent = ACCENTS[i % ACCENTS.length];

  // All cards are sticky inside ONE shared list, so later cards slide over
  // earlier ones and the stack stays pinned until the list ends.
  return (
      <motion.article
        style={{
          scale: reduced ? 1 : scale,
          top: `calc(84px + ${i * 22}px)`,
        }}
        className={`glass-card sticky w-full origin-top overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_-12px_40px_-24px_rgba(var(--ink-rgb),0.35)] ${
          i < total - 1 ? "mb-[22svh]" : ""
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.16] blur-3xl"
          style={{ background: accent }}
        />
        <div className="relative grid gap-8 p-6 sm:p-9 md:grid-cols-[1.25fr_1fr] md:gap-12 md:p-12">
          <div>
            <div className="flex items-center gap-4">
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg"
                style={{ background: accent, boxShadow: `0 12px 30px -12px ${accent}` }}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[0.72rem] uppercase tracking-[0.16em] text-faint">
                Step {step.number} of {String(total).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-6 font-display text-[clamp(1.8rem,1.3rem+2.2vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground">
              {step.title}
            </h3>
            <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-muted sm:text-[1.02rem]">
              {step.description}
            </p>
          </div>

          <div className="flex flex-col justify-end">
            <span className="t-label">You get</span>
            <ul className="mt-4 space-y-3">
              {step.outputs.map((o) => (
                <li
                  key={o}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-[0.9rem] text-muted-strong"
                >
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white"
                    style={{ background: accent }}
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-6 right-6 select-none font-display text-[7rem] font-bold leading-none text-transparent [-webkit-text-stroke:1px_var(--border-strong)] sm:text-[9rem]"
        >
          {step.number}
        </span>
      </motion.article>
  );
}

export function Process() {
  const reduced = useReducedMotion();
  const list = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start start", "end end"] });
  const lineTip = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  // soft "landing" thump as each step card stacks onto the previous one
  const stepIdx = useRef(0);
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(processSteps.length - 1, Math.floor(v * processSteps.length + 0.15));
    if (i !== stepIdx.current) {
      if (i > stepIdx.current) sound.play("cardSlap");
      stepIdx.current = i;
      setStep(Math.max(0, i));
    }
  });

  return (
    <section data-cursor-icon="pencil" id="process" className="section tinted tint-mint">
      <div className="container-page">
        <SectionHeading
          index="05"
          eyebrow="Process"
          title={"Five stages —\neach with\na clear output."}
          lead="You always know where the project is and what comes next — no black box between kickoff and launch."
        />

        <div ref={list} className="relative mx-auto mt-14 max-w-5xl pb-[8svh]">
          {/* #8 big sticky step counter (wide screens) */}
          <div aria-hidden className="pointer-events-none absolute -left-40 bottom-[8svh] top-0 hidden w-24 min-[1400px]:block">
            <div className="sticky top-[40vh] text-right">
              <div className="relative h-[5.5rem] overflow-hidden font-display text-[5rem] font-bold leading-none tracking-[-0.05em] text-foreground">
                {processSteps.map((s, k) => (
                  <span
                    key={s.number}
                    className="absolute inset-0 transition-[transform,opacity] duration-500 ease-[var(--ease)]"
                    style={{ transform: `translateY(${(k - step) * 100}%)`, opacity: k === step ? 1 : 0 }}
                  >
                    {s.number}
                  </span>
                ))}
              </div>
              <div className="mt-1 font-[family-name:var(--font-mono)] text-[0.72rem] uppercase tracking-[0.2em] text-faint">
                of {String(processSteps.length).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* glowing progress line that draws itself down through the steps */}
          {!reduced && (
            <div aria-hidden className="pointer-events-none absolute -left-7 bottom-[8svh] top-0 hidden w-[2px] rounded-full bg-border xl:-left-12 lg:block">
              <motion.div
                style={{ scaleY: scrollYProgress }}
                className="absolute inset-0 origin-top rounded-full bg-[linear-gradient(180deg,#6a46ff,#3d63ff,#c026d3,#0ea5e9,#16a34a)] shadow-[0_0_14px_2px_rgba(106,70,255,0.55)]"
              />
              <motion.span
                style={{ top: lineTip }}
                className="absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgba(106,70,255,0.35),0_0_24px_6px_rgba(106,70,255,0.7)]"
              />
            </div>
          )}
          {processSteps.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              i={i}
              total={processSteps.length}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
