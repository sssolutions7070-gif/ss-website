import type { CSSProperties } from "react";

type Shape = {
  kind: "sphere" | "ring" | "cube" | "pill";
  /** position/size in % of the section (left/top) and px (size) */
  x: string;
  y: string;
  size: number;
  c1?: string;
  c2?: string;
  rotate?: number;
  delay?: number;
  /** hide below this breakpoint to keep phones clean */
  desktopOnly?: boolean;
};
type Orb = { x: string; y: string; size: string; color: string; delay?: number };

const PRESETS: Record<string, { orbs?: Orb[]; dots?: { x: string; y: string }; shapes?: Shape[] }> = {
  services: {
    orbs: [
      { x: "-10%", y: "-12%", size: "42rem", color: "#8b6cff" },
      { x: "70%", y: "55%", size: "36rem", color: "#5aa9ff", delay: -8 },
    ],
    dots: { x: "88%", y: "10%" },
    shapes: [
      { kind: "sphere", x: "88%", y: "6%", size: 74, desktopOnly: true },
      { kind: "ring", x: "4%", y: "48%", size: 90, c1: "#6a46ff", c2: "#22d3ee", delay: -3, desktopOnly: true },
      { kind: "cube", x: "92%", y: "70%", size: 46, rotate: 18, delay: -5, desktopOnly: true },
    ],
  },
  work: {
    orbs: [
      { x: "60%", y: "-10%", size: "38rem", color: "#c026d3" },
      { x: "-15%", y: "50%", size: "34rem", color: "#6a46ff", delay: -10 },
    ],
    dots: { x: "12%", y: "8%" },
  },
  pricing: {
    orbs: [
      { x: "30%", y: "10%", size: "46rem", color: "#6a46ff" },
      { x: "-10%", y: "60%", size: "30rem", color: "#ff7ab6", delay: -6 },
      { x: "75%", y: "55%", size: "30rem", color: "#22d3ee", delay: -12 },
    ],
    shapes: [
      { kind: "pill", x: "6%", y: "14%", size: 96, rotate: -24, desktopOnly: true },
      { kind: "sphere", x: "90%", y: "18%", size: 56, c1: "#ff9ad5", c2: "#c026d3", delay: -4, desktopOnly: true },
    ],
  },
  team: {
    dots: { x: "80%", y: "40%" },
    shapes: [
      { kind: "ring", x: "84%", y: "20%", size: 120, c1: "#c026d3", c2: "#6a46ff", desktopOnly: true },
      { kind: "cube", x: "86%", y: "76%", size: 54, c1: "#22d3ee", c2: "#3d63ff", rotate: -12, delay: -4, desktopOnly: true },
      { kind: "sphere", x: "93%", y: "56%", size: 38, c1: "#ffd166", c2: "#f08a24", delay: -2, desktopOnly: true },
    ],
  },
  grid: {
    orbs: [{ x: "65%", y: "0%", size: "34rem", color: "#3d63ff" }],
    dots: { x: "85%", y: "20%" },
  },
  contact: {
    orbs: [
      { x: "-12%", y: "-5%", size: "40rem", color: "#6a46ff" },
      { x: "70%", y: "50%", size: "34rem", color: "#22d3ee", delay: -9 },
    ],
  },
  tech: {
    shapes: [
      { kind: "sphere", x: "6%", y: "10%", size: 60, c1: "#ffb36b", c2: "#e8590c", desktopOnly: true },
      { kind: "pill", x: "88%", y: "80%", size: 84, c1: "#ff7ab6", c2: "#f08a24", rotate: 30, delay: -3, desktopOnly: true },
    ],
  },
};

/**
 * Decorative background for a section: soft drifting colour orbs, a masked
 * dot grid and a few glossy floating 3D-style shapes. Pure CSS, aria-hidden,
 * transform-only animation. The parent section needs `relative isolate`.
 */
export function Decor({ preset }: { preset: keyof typeof PRESETS }) {
  const p = PRESETS[preset];
  return (
    <div className="decor" aria-hidden>
      {p.orbs?.map((o, i) => (
        <span
          key={`o${i}`}
          className="decor-orb"
          style={{
            left: o.x,
            top: o.y,
            width: o.size,
            height: o.size,
            background: `radial-gradient(circle, color-mix(in oklab, ${o.color} 32%, transparent), transparent 68%)`,
            animationDelay: `${o.delay ?? 0}s`,
          }}
        />
      ))}
      {p.dots && <span className="decor-dots" style={{ "--dots-x": p.dots.x, "--dots-y": p.dots.y } as CSSProperties} />}
      {p.shapes?.map((s, i) => (
        <span
          key={`s${i}`}
          className={`decor-shape shape-${s.kind} ${s.desktopOnly ? "decor-shape-sm" : ""}`}
          style={
            {
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.kind === "pill" ? s.size * 0.38 : s.size,
              "--c1": s.c1,
              "--c2": s.c2,
              "--r": `${s.rotate ?? 0}deg`,
              animationDelay: `${s.delay ?? 0}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
