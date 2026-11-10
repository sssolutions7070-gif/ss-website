import type { Metadata } from "next";
import { MagneticButton } from "@/components/ui/MagneticButton";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

const FACES = ["front", "back", "right", "left", "top", "bottom"] as const;

/** 404 — a spinning 3D "SS" cube stands in for the zero. */
export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(50% 50% at 50% 40%, rgba(106,70,255,0.18), transparent 70%)" }}
      />
      <div className="container-page flex flex-col items-center text-center">
        <div className="flex items-center gap-[clamp(0.6rem,2vw,1.6rem)] font-display text-[clamp(6rem,3rem+14vw,15rem)] font-bold leading-none tracking-[-0.06em] text-foreground">
          <span>4</span>
          <div className="nf-scene" aria-hidden>
            <div className="nf-cube">
              {FACES.map((f) => (
                <span key={f} className={`nf-face nf-${f}`}>
                  SS
                </span>
              ))}
            </div>
          </div>
          <span>4</span>
        </div>
        <span className="sr-only">404</span>

        <h1 className="t-h2 mt-10 text-foreground">
          This page took a <span className="text-gradient-anim">wrong turn.</span>
        </h1>
        <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-muted">
          The link may be old or mistyped. Everything we build is one click away — start from the home page.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <MagneticButton href="/" size="lg">
            Back home
          </MagneticButton>
          <MagneticButton href="/#work" size="lg" variant="secondary" withArrow={false}>
            See our projects
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
