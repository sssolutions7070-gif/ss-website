"use client";

import {
  UtensilsCrossed,
  Car,
  HeartHandshake,
  ShoppingBag,
  Briefcase,
  Stethoscope,
  GraduationCap,
  Gamepad2,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { industries } from "@/data/industries";
import { projects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TransitionLink } from "@/components/providers/PageTransition";

const ICONS: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  HeartHandshake,
  ShoppingBag,
  Briefcase,
  Stethoscope,
  GraduationCap,
  Gamepad2,
};

/** Industries we've built for, each linked to a real case study. */
export function Industries() {
  return (
    <section id="industries" className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="Industries"
          title={"Built for businesses\nlike yours."}
          lead="From food delivery to NGOs — every card links to a real product we built in that space."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((ind, i) => {
            const Icon = ICONS[ind.icon] ?? Briefcase;
            const p = projects.find((x) => x.id === ind.project);
            return (
              <ScrollReveal key={ind.name} delay={(i % 4) * 0.06} className="h-full">
                <TransitionLink
                  magnetic
                  href={`/work/${ind.project}`}
                  label={p?.title ?? ind.name}
                  accent={ind.color}
                  className="touch-tilt glass-card group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-surface p-6 shadow-[var(--card-shadow)] transition-[transform,border-color] duration-500 ease-[var(--ease)] hover:-translate-y-1 hover:border-border-strong"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                    style={{ background: ind.color }}
                  />
                  <span
                    className="icon3d grid h-12 w-12 place-items-center rounded-2xl text-white"
                    style={{ background: `linear-gradient(140deg, ${ind.color}, color-mix(in oklab, ${ind.color} 60%, #000))`, boxShadow: `0 14px 30px -14px ${ind.color}` }}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-[1.15rem] font-semibold text-foreground">{ind.name}</h3>
                  <p className="mt-2 flex-1 text-[0.88rem] leading-relaxed text-muted">{ind.text}</p>
                  <span className="mt-5 text-[0.8rem] font-medium text-muted-strong transition-colors group-hover:text-foreground">
                    See {p?.title.split(" — ")[0] ?? "project"}
                    <ArrowUpRight className="ml-1 inline h-3.5 w-3.5 align-[-2px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </TransitionLink>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
