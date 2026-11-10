"use client";

import { useEffect, useRef } from "react";
import { registerGsap, prefersReducedMotion } from "@/lib/animations";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { ScrollFillText } from "@/components/fx/ScrollFillText";

const STAGES = ["Idea", "Product", "Growth"];

export function Positioning() {
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    const pathEl = path.current;
    if (prefersReducedMotion() || !pathEl || !rootEl) return;
    const { gsap } = registerGsap();
    const len = pathEl.getTotalLength();

    const ctx = gsap.context(() => {
      gsap.set(pathEl, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(pathEl, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: rootEl,
          start: "top 75%",
          end: "bottom 65%",
          scrub: 0.6,
        },
      });
      gsap.from(".pos-node", {
        opacity: 0,
        y: 8,
        stagger: 0.18,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: rootEl, start: "top 68%" },
      });
    }, rootEl);

    return () => ctx.revert();
  }, []);

  return (
    <section id="positioning" className="section-tight border-y border-border">
      <div ref={root} className="container-page">
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div>
            <p className="eyebrow mb-5">
              <span className="h-px w-7 bg-border-strong" />
              How the work compounds
            </p>
            <AnimatedHeading
              as="h2"
              text={"From idea,\nto product,\nto growth."}
              className="t-h2 text-foreground"
            />
            <ScrollFillText
              text="SS Solutions turns ideas into scalable digital products, experiences and automated systems — then helps them grow."
              className="mt-6 max-w-lg font-display text-[clamp(1.2rem,1rem+0.8vw,1.6rem)] font-medium leading-snug text-foreground"
            />
          </div>

          <div className="relative">
            <svg viewBox="0 0 800 120" className="w-full" fill="none" aria-hidden>
              <path
                ref={path}
                d="M40 92 C 220 92, 210 34, 400 34 S 590 92, 760 44"
                stroke="url(#pgrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="pgrad" x1="0" y1="0" x2="800" y2="0">
                  <stop offset="0%" stopColor="rgba(var(--ink-rgb),0.35)" />
                  <stop offset="60%" stopColor="#7c5cff" />
                  <stop offset="100%" stopColor="#5b7cff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="mt-3 flex items-center justify-between">
              {STAGES.map((s, i) => (
                <div key={s} className="pos-node flex items-center gap-2.5">
                  <span className="font-[family-name:var(--font-mono)] text-[0.7rem] text-purple-light">
                    0{i + 1}
                  </span>
                  <span className="text-[0.9rem] font-medium text-foreground">
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
