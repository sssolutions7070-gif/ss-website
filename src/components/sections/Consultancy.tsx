"use client";

import { useState } from "react";
import { consultancyLayers } from "@/data/process";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";

export function Consultancy() {
  const [active, setActive] = useState(0);

  return (
    <section id="consultancy" className="section border-t border-border">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-5">
              <span className="text-purple-light">04</span>
              <span className="text-border-strong">/</span>
              Consultancy
            </p>
            <AnimatedHeading
              as="h2"
              text={"You bring\nthe idea.\nWe design the\ndigital path."}
              className="t-h2 text-foreground"
            />
            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-muted">
              Practical direction from a team that also builds. We help you make
              the expensive decisions early — before they cost time.
            </p>

            <div className="mt-8 border-l border-border-strong pl-5">
              <p className="t-label">
                {String(active + 1).padStart(2, "0")} —{" "}
                {consultancyLayers[active].label}
              </p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-strong">
                {consultancyLayers[active].detail}
              </p>
            </div>

            <div className="mt-8">
              <TextLink href="#contact">Book a consultation</TextLink>
            </div>
          </div>

          <ul className="border-t border-border">
            {consultancyLayers.map((layer, i) => (
              <li key={layer.label} className="border-b border-border">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-5 py-5 text-left transition-colors duration-300",
                    active === i ? "opacity-100" : "opacity-80 hover:opacity-100",
                  )}
                >
                  <span
                    className={cn(
                      "font-[family-name:var(--font-mono)] text-[0.75rem] transition-colors",
                      active === i ? "text-purple-light" : "text-muted-strong",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-display text-[1.05rem] font-medium text-foreground md:text-[1.2rem]">
                    {layer.label}
                  </span>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                      active === i ? "bg-purple" : "bg-border-strong",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
