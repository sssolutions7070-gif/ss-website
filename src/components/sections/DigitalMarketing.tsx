"use client";

import { useEffect, useRef } from "react";
import { marketingFlow } from "@/data/process";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { TextLink } from "@/components/ui/TextLink";
import { registerGsap, prefersReducedMotion } from "@/lib/animations";
import { Decor } from "@/components/graphics/Decor";

const CAPABILITIES = [
  "Website development",
  "SEO & technical SEO",
  "Social media strategy",
  "Performance marketing",
  "Conversion optimisation",
  "Analytics & attribution",
  "Content strategy",
  "Product positioning",
];

export function DigitalMarketing() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    if (prefersReducedMotion() || !rootEl) return;
    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      gsap.from(".mkt-node", {
        opacity: 0,
        y: 18,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: ".mkt-flow", start: "top 80%" },
      });
      gsap.from(".mkt-connector", {
        scaleY: 0,
        transformOrigin: "top center",
        stagger: 0.1,
        duration: 0.35,
        ease: "power2.out",
        scrollTrigger: { trigger: ".mkt-flow", start: "top 80%" },
      });
    }, rootEl);
    return () => ctx.revert();
  }, []);

  return (
    <section id="marketing" className="section relative isolate">
      <Decor preset="grid" />
      <div ref={root} className="container-page">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-5">
              <span className="text-purple-light">03</span>
              <span className="text-border-strong">/</span>
              Digital marketing
            </p>
            <AnimatedHeading
              as="h2"
              text={"Build it.\nLaunch it.\nGrow it."}
              className="t-display text-foreground"
              stagger={0.08}
            />
            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-muted">
              We don&apos;t stop at shipping. SS Solutions treats growth as an
              engineering problem — instrument it, test it, iterate.
            </p>

            <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {CAPABILITIES.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-2.5 text-[0.85rem] text-muted-strong"
                >
                  <span className="h-px w-2.5 shrink-0 bg-faint" />
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <TextLink href="#contact">Talk growth strategy</TextLink>
            </div>
          </div>

          <div className="mkt-flow relative flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface/60 p-6 md:p-8">
            <p className="t-label mb-6">The growth flow</p>
            {marketingFlow.map((node, i) => (
              <div key={node.label} className="mkt-node">
                <div className="flex items-center gap-4 py-3">
                  <span className="w-6 shrink-0 font-[family-name:var(--font-mono)] text-[0.7rem] text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[0.95rem] font-semibold text-foreground">
                      {node.label}
                    </p>
                    <p className="truncate text-[0.8rem] text-muted">
                      {node.caption}
                    </p>
                  </div>
                </div>
                {i < marketingFlow.length - 1 && (
                  <div className="mkt-connector ml-[0.7rem] h-4 w-px origin-top bg-border-strong" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
