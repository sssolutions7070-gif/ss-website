"use client";

import { Check, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useScrollTo } from "@/hooks/useLenis";
import { cn } from "@/lib/utils";
import { Decor } from "@/components/graphics/Decor";
import { useState } from "react";

/**
 * Ways to work with us. Prices are intentionally "on request" until real
 * figures are provided — set `price` (e.g. "From ₹25,000") to show one.
 */
const PLANS: {
  name: string;
  tagline: string;
  price?: string;
  timeline: string;
  features: string[];
  popular?: boolean;
}[] = [
  {
    name: "Launch",
    tagline: "A fast, professional website for your business.",
    timeline: "Typically 2–4 weeks",
    features: [
      "Custom design, mobile-first",
      "Up to 8 pages + contact & WhatsApp",
      "SEO setup and Google Analytics",
      "Hosting & domain setup",
      "1 month of support",
    ],
  },
  {
    name: "Grow",
    tagline: "A web app or Android app that runs part of your business.",
    timeline: "Typically 6–12 weeks",
    popular: true,
    features: [
      "Web app or Android app (or both)",
      "Admin panel & dashboards",
      "Login, payments, notifications",
      "Play Store / production launch",
      "3 months of support",
    ],
  },
  {
    name: "Scale",
    tagline: "Custom platforms, AI and automation for complex needs.",
    timeline: "Scoped together",
    features: [
      "Multi-app platforms (customer, vendor, delivery)",
      "AI features & RAG agents",
      "Integrations & workflow automation",
      "Dedicated team & roadmap",
      "Ongoing maintenance plan",
    ],
  },
];

const BLOB = ["#16a34a", "#6a46ff", "#c026d3"];

export function Engagements() {
  const scrollTo = useScrollTo();
  const [hot, setHot] = useState(1);
  return (
    <section data-cursor-icon="rocket" id="pricing" className="section relative isolate">
      <Decor preset="pricing" />
      <div className="container-page">
        <SectionHeading
          eyebrow="Ways to work with us"
          title={"Pick a starting\npoint."}
          lead="Every project is quoted after a free call — these are the three shapes most of our work takes."
          align="center"
          className="md:flex-col md:items-center"
        />

        <div className="relative mt-14 grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
          {/* #14 morphing colour blob that follows the hovered plan */}
          <span
            aria-hidden
            className="pricing-blob pointer-events-none absolute top-1/2 -z-10 hidden h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 lg:block"
            style={{ left: `${16.66 + hot * 33.33}%`, background: `radial-gradient(circle at 50% 50%, ${BLOB[hot]}55, ${BLOB[hot]}1f 32%, transparent 60%)` }}
          />
          {PLANS.map((p, i) => (
            <ScrollReveal key={p.name} delay={i * 0.08} className={cn("h-full", p.popular && "lg:-my-4")}>
              <div
                data-magnetic
                onMouseEnter={() => setHot(i)}
                className={cn(
                  "touch-tilt relative flex h-full flex-col rounded-[28px] border p-7 transition-transform duration-500 ease-[var(--ease)] hover:-translate-y-1.5 sm:p-8",
                  p.popular
                    ? "spot-card ring-anim border-transparent bg-[linear-gradient(160deg,#6a46ff,#3d63ff)] text-white shadow-[0_40px_80px_-30px_rgba(106,70,255,0.7)]"
                    : "glass-card border-border bg-surface shadow-[var(--card-shadow)]",
                )}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#ffd166] px-3.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#3b2a00] shadow-lg">
                    Most popular
                  </span>
                )}
                <h3 className={cn("font-display text-[1.6rem] font-semibold", p.popular ? "text-white" : "text-foreground")}>
                  {p.name}
                </h3>
                <p className={cn("mt-2 text-[0.92rem]", p.popular ? "text-white/80" : "text-muted")}>{p.tagline}</p>

                <div className="mt-6">
                  <div className={cn("font-display text-[1.9rem] font-semibold leading-none", p.popular ? "text-white" : "text-foreground")}>
                    {p.price ?? "Custom quote"}
                  </div>
                  <div className={cn("mt-2 text-[0.8rem]", p.popular ? "text-white/70" : "text-faint")}>{p.timeline}</div>
                </div>

                <ul className={cn("mt-7 space-y-3 border-t pt-6", p.popular ? "border-white/20" : "border-border")}>
                  {p.features.map((f) => (
                    <li key={f} className={cn("flex items-start gap-3 text-[0.9rem]", p.popular ? "text-white/90" : "text-muted-strong")}>
                      <span
                        className={cn(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                          p.popular ? "bg-white/20 text-white" : "bg-[color-mix(in_oklab,var(--purple)_14%,transparent)] text-purple-light",
                        )}
                      >
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => scrollTo("#contact", -88)}
                  className={cn(
                    "group mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.92rem] font-semibold transition-colors",
                    p.popular ? "bg-white text-[#3b2bd1] hover:bg-white/90" : "border border-border-strong text-foreground hover:bg-[rgba(var(--ink-rgb),0.05)]",
                  )}
                >
                  Get a quote
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
