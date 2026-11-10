"use client";

import { differentiators } from "@/data/process";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function WhySSSolutions() {
  return (
    <section id="about" className="section relative overflow-hidden">
      {/* oversized ghost wordmark — depth from typography, not a 3D toy */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[6vw] top-[8%] select-none font-display text-[38vw] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(var(--ink-rgb),0.06)] md:text-[22vw]"
      >
        SS
      </span>

      <div className="container-page relative">
        <div className="max-w-2xl">
          <p className="eyebrow mb-5">
            <span className="text-purple-light">06</span>
            <span className="text-border-strong">/</span>
            Why us
          </p>
          <AnimatedHeading
            as="h2"
            text={"Practical value,\nnot big claims."}
            className="t-h2 text-foreground"
          />
          <p className="mt-6 text-[0.95rem] leading-relaxed text-muted">
            We won&apos;t tell you we&apos;re the best. Here is what actually
            shapes the way we work.
          </p>
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-16">
          {differentiators.map((d, i) => {
            const Icon = d.icon;
            return (
              <ScrollReveal key={d.title} delay={(i % 3) * 0.06}>
                <div className="border-t border-border-strong pt-5">
                  <Icon className="h-5 w-5 text-foreground" />
                  <h3 className="mt-4 font-display text-[1.05rem] font-semibold text-foreground">
                    {d.title}
                  </h3>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
                    {d.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
