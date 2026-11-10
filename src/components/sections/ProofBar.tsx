"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useInView } from "framer-motion";
import { Rocket, Smartphone, Download, Layers, type LucideIcon } from "lucide-react";
import { projects } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { sound } from "@/lib/sound";

/** Real, verifiable numbers only. */
const STATS: { value: number; suffix: string; label: string; icon: LucideIcon; color: string }[] = [
  { value: projects.length, suffix: "", label: "Projects delivered", icon: Rocket, color: "#6a46ff" },
  { value: 3, suffix: "", label: "Android apps live on Google Play", icon: Smartphone, color: "#16a34a" },
  { value: 1, suffix: "K+", label: "Downloads — Best Food Services app", icon: Download, color: "#3d63ff" },
  { value: 4, suffix: "", label: "Disciplines: web, mobile, AI, Web3", icon: Layers, color: "#c026d3" },
];

/** Clients and products — real logos where we have them, a monogram otherwise. */
const WORK: { name: string; logo?: string; tint: string }[] = [
  { name: "Best Food Services", logo: "/clients/best-food-services.png", tint: "#16a34a" },
  { name: "DriveBloc", logo: "/clients/drivebloc.png", tint: "#e11d48" },
  { name: "Swamini Foods", logo: "/clients/swamini-foods.svg", tint: "#d97706" },
  { name: "Vishwaguru Foundation", logo: "/clients/vishwaguru.jpg", tint: "#7c3aed" },
  { name: "DreamRole", logo: "/clients/dreamrole.svg", tint: "#5b4bff" },
  { name: "FlowShift", logo: "/clients/flowshift.svg", tint: "#ec4899" },
  { name: "Neon Escape", logo: "/clients/neon-escape.svg", tint: "#06b6d4" },
];

/** Odometer: each digit is a 0–9 column that rolls into place once in view. */
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  // odometer ticks as the numbers roll in (only plays when sound is on)
  useEffect(() => {
    if (inView) sound.play("roll");
  }, [inView]);
  const reduced = useReducedMotion();
  const digits = String(to).split("");

  return (
    <span ref={ref} className="inline-flex tabular-nums">
      <span className="sr-only">{`${to}${suffix}`}</span>
      {digits.map((d, i) => (
        <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden leading-none">
          <span
            className="flex flex-col transition-transform duration-[1.6s] motion-reduce:transition-none ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              // roll through a full turn + the target digit
              transform: `translateY(${inView || reduced ? -(10 + Number(d)) : 0}em)`,
              transitionDelay: `${i * 0.12}s`,
            }}
          >
            {Array.from({ length: 20 }, (_, n) => (
              <span key={n} className="block h-[1em]">
                {n % 10}
              </span>
            ))}
          </span>
        </span>
      ))}
      <span aria-hidden className="leading-none">{suffix}</span>
    </span>
  );
}

export function ProofBar() {
  return (
    <section aria-label="Track record" className="relative z-10 border-y border-border bg-background-elevated">
      <div className="container-page grid grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={[
              "flex flex-col gap-2 py-8 lg:py-10",
              i % 2 === 1 ? "pl-6 border-l border-border" : "",
              i >= 2 ? "border-t border-border lg:border-t-0" : "",
              i === 2 ? "lg:pl-6 lg:border-l" : "",
              i > 0 && i !== 2 ? "lg:pl-6" : "",
            ].join(" ")}
          >
            <span
              className="mb-2 grid h-11 w-11 place-items-center rounded-full"
              style={{ background: `color-mix(in oklab, ${s.color} 14%, transparent)`, color: s.color }}
            >
              <s.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display text-[clamp(2rem,1.4rem+2.4vw,3.2rem)] font-semibold leading-none text-foreground">
              <Counter to={s.value} suffix={s.suffix} />
            </span>
            <span className="text-[0.82rem] leading-snug text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border py-8">
        <div className="container-page flex flex-col items-center gap-6 lg:flex-row lg:gap-10">
          <span className="t-label shrink-0 text-center lg:text-left">
            Trusted by teams
            <br className="hidden lg:block" /> across India
          </span>
          <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-8 gap-y-5 lg:justify-between">
            {WORK.map((w) => (
              <li
                key={w.name}
                className="group/logo flex items-center gap-3 opacity-60 grayscale transition-[filter,opacity] duration-500 hover:opacity-100 hover:grayscale-0"
              >
                {w.logo ? (
                  <Image
                    src={w.logo}
                    alt=""
                    width={40}
                    height={40}
                    className={`h-9 w-9 rounded-xl border border-border object-contain ${w.logo.endsWith(".svg") ? "" : "bg-white"}`}
                  />
                ) : (
                  <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl font-bold text-white" style={{ background: w.tint }}>
                    {w.name.charAt(0)}
                  </span>
                )}
                <span className="whitespace-nowrap font-display text-[0.98rem] font-semibold text-foreground">{w.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
