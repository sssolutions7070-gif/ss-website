"use client";

import { useRef, type PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import type { Service } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useHasPointer } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollTo } from "@/hooks/useLenis";
import { cn } from "@/lib/utils";
import { Decor } from "@/components/graphics/Decor";
import { DoorReveal } from "@/components/fx/DoorReveal";

/** Bento layout on large screens: two wide cards, four regular, two wide. */
const WIDE = new Set([0, 1, 6, 7]);
const ACCENTS = ["#6a46ff", "#3d63ff", "#0ea5e9", "#c026d3", "#f97316", "#16a34a", "#e11d48", "#7c3aed"];

function ServiceCard({ service, i }: { service: Service; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const hasPointer = useHasPointer();
  const reduced = useReducedMotion();
  const scrollTo = useScrollTo();
  const tilt = hasPointer && !reduced;
  const Icon = service.icon;
  const wide = WIDE.has(i);
  const accent = ACCENTS[i % ACCENTS.length];

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !tilt) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ ["--accent" as string]: accent }}
      className={cn(
        "glass-card group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-surface p-6 shadow-[var(--card-shadow)] transition-[transform,border-color,box-shadow] duration-300 ease-out will-change-transform hover:border-border-strong sm:p-7",
        wide && "lg:p-9",
      )}
    >
      {/* cursor spotlight in the card's accent colour */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx,50%) var(--my,0%), color-mix(in oklab, var(--accent) 16%, transparent), transparent 65%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-[0.1] blur-3xl transition-opacity duration-500 group-hover:opacity-25"
        style={{ background: accent }}
      />

      <div className="relative flex items-start justify-between gap-4">
        {/* extruded 3D icon tile: stacked layers give it real thickness */}
        <span className="block" style={{ perspective: 400 }}>
          <span className="icon3d" style={{ animationDelay: `${-i * 0.7}s` }}>
            {[0, 1, 2, 3, 4].map((k) => (
              <span
                key={k}
                aria-hidden
                className="icon3d-layer"
                style={{
                  transform: `translateZ(${k * 2}px)`,
                  background: `color-mix(in oklab, ${accent} ${55 + k * 5}%, #000)`,
                }}
              />
            ))}
            <span
              className="icon3d-layer icon3d-face"
              style={{
                background: `linear-gradient(140deg, color-mix(in oklab, ${accent} 70%, #fff), ${accent})`,
                boxShadow: `0 18px 30px -14px ${accent}`,
              }}
            >
              <Icon className="h-5 w-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]" aria-hidden />
            </span>
          </span>
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[0.72rem] text-faint">
          {String(i + 1).padStart(2, "0")}
        </span>
      </div>

      <h3
        className={cn(
          "relative mt-6 font-display font-semibold leading-tight tracking-[-0.02em] text-foreground",
          wide ? "text-[1.5rem] lg:text-[1.85rem]" : "text-[1.3rem]",
        )}
      >
        {service.title}
      </h3>
      <p className={cn("relative mt-3 text-[0.9rem] leading-relaxed text-muted", wide && "lg:max-w-md lg:text-[0.95rem]")}>
        {wide ? service.description : service.summary}
      </p>

      <ul className="relative mt-5 flex flex-wrap gap-2">
        {service.capabilities.slice(0, wide ? 5 : 3).map((cap) => (
          <li
            key={cap}
            className="rounded-full border border-border bg-background/60 px-3 py-1 text-[0.74rem] text-muted-strong"
          >
            {cap}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => scrollTo(service.cta.href, -88)}
        className="relative mt-auto inline-flex items-center gap-1.5 self-start pt-6 text-[0.86rem] font-medium text-foreground"
      >
        <span className="link-underline">{service.cta.label}</span>
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

export function Services() {
  return (
    <section data-cursor-icon="sparkle" id="services" className="section tinted tint-lavender relative isolate">
      <Decor preset="services" />
      <DoorReveal />
      <div className="container-page">
        <SectionHeading
          index="01"
          eyebrow="Services"
          title={`${["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"][services.length] ?? services.length} capabilities,\none team.`}
          lead="Design, engineering, growth and strategy — combined into whatever your product actually needs, delivered by the people who build it."
          action={<TextLink href="#contact">Scope your project</TextLink>}
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {services.map((service, i) => (
            <ScrollReveal
              key={service.id}
              delay={(i % 4) * 0.06}
              className={cn("h-full", WIDE.has(i) && "md:col-span-2 lg:col-span-2")}
            >
              <ServiceCard service={service} i={i} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
