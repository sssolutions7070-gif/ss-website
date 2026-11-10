"use client";

import dynamic from "next/dynamic";
import { company } from "@/data/company";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";

const CtaBackdrop = dynamic(
  () => import("@/components/three/CtaBackdrop").then((m) => m.CtaBackdrop),
  { ssr: false },
);

export function FinalCTA() {
  return (
    <section
      id="cta"
      className="relative flex flex-col items-center overflow-hidden pb-28 pt-10 md:pb-40 md:pt-16"
    >
      {/* soft glow behind the particle mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60%] bg-[radial-gradient(45%_55%_at_50%_45%,color-mix(in_oklab,var(--purple)_14%,transparent),transparent_70%)]"
      />
      <CtaBackdrop className="pointer-events-none relative h-[34svh] w-full sm:h-[40svh] lg:h-[46svh]" />

      <div className="container-page relative w-full text-center">
        <p className="eyebrow mb-7 justify-center">
          <span className="h-px w-7 bg-border-strong" />
          Let&apos;s build
        </p>
        <AnimatedHeading
          as="h2"
          text={"Ready to build\nwhat's next?"}
          className="t-display mx-auto max-w-[16ch] text-foreground"
        />
        <p className="mx-auto mt-7 max-w-lg text-[1.05rem] leading-relaxed text-muted-strong">
          Tell us what you&apos;re building. We&apos;ll turn the idea into a
          digital product — and a plan to grow it.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton href="#contact" size="lg">
            Start a project
          </MagneticButton>
          <MagneticButton
            href={`tel:${company.people[0].phoneHref}`}
            variant="secondary"
            size="lg"
            withArrow={false}
          >
            Call SS Solutions
          </MagneticButton>
        </div>

        <p className="mt-8 text-[0.8rem] text-faint">
          {company.people.map((p, i) => (
            <span key={p.phoneHref}>
              {i > 0 && <span className="mx-2 text-border-strong">·</span>}
              <a
                href={`tel:${p.phoneHref}`}
                className="transition-colors hover:text-foreground"
              >
                {p.name} {p.phone}
              </a>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
