"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight SVG alternative to the 3D globe (used on phones): Pune in the
 * centre with animated arcs to the cities we work with. Dots are placed by
 * real latitude/longitude; no country outline is drawn.
 */
const PUNE = { name: "Pune", lat: 18.52, lon: 73.86 };
// `left: true` puts the label on the left of the dot so nearby labels don't collide
const CITIES: { name: string; lat: number; lon: number; left?: boolean; dy?: number }[] = [
  { name: "Mumbai", lat: 19.08, lon: 72.88, left: true, dy: -9 },
  { name: "Delhi", lat: 28.61, lon: 77.21 },
  { name: "Bengaluru", lat: 12.97, lon: 77.59, left: true },
  { name: "Hyderabad", lat: 17.39, lon: 78.49 },
  { name: "Chennai", lat: 13.08, lon: 80.27 },
  { name: "Kolkata", lat: 22.57, lon: 88.36 },
  { name: "Ahmedabad", lat: 23.02, lon: 72.57, left: true },
  { name: "Jaipur", lat: 26.91, lon: 75.79 },
  { name: "Nagpur", lat: 21.15, lon: 79.09 },
];

// projection bounds (lon 68–92, lat 8–31) → 300 × 320 viewBox
const W = 300;
const H = 320;
const x = (lon: number) => ((lon - 68) / 24) * W;
const y = (lat: number) => H - ((lat - 8) / 23) * H;

export function IndiaCities() {
  const ref = useRef<SVGSVGElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const px = x(PUNE.lon);
  const py = y(PUNE.lat);

  return (
    <div className="relative mt-8 overflow-hidden rounded-[24px] border border-border bg-surface p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(var(--ink-rgb),0.14) 1px, transparent 1.3px)",
          backgroundSize: "14px 14px",
        }}
      />
      <svg ref={ref} viewBox={`-10 -10 ${W + 20} ${H + 20}`} className="relative w-full" role="img" aria-label="Pune connected to cities across India">
        <defs>
          <linearGradient id="arc-g" x1="0" x2="1">
            <stop offset="0" stopColor="#6a46ff" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <radialGradient id="pune-glow">
            <stop offset="0" stopColor="#6a46ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#6a46ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={px} cy={py} r="46" fill="url(#pune-glow)" />
        {CITIES.map((c, i) => {
          const cx = x(c.lon);
          const cy = y(c.lat);
          // control point lifted perpendicular to the chord → a soft arc
          const mx = (px + cx) / 2;
          const my = (py + cy) / 2;
          const dx = cx - px;
          const dy = cy - py;
          const len = Math.hypot(dx, dy) || 1;
          const k = Math.min(60, len * 0.35);
          // perpendicular offset, flipped so every arc bows upward
          const s = dx / len > 0 ? -1 : 1;
          const qx = mx + (dy / len) * k * s * -1;
          const qy = my + (dx / len) * k * s;
          return (
            <g key={c.name}>
              <path
                d={`M${px} ${py} Q${qx} ${qy} ${cx} ${cy}`}
                fill="none"
                stroke="url(#arc-g)"
                strokeWidth="1.6"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={on ? 0 : 1}
                style={{ transition: `stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1) ${0.2 + i * 0.12}s` }}
                opacity="0.85"
              />
              <circle
                cx={cx}
                cy={cy}
                r="3.6"
                fill="#22d3ee"
                style={{ opacity: on ? 1 : 0, transition: `opacity .4s ${0.9 + i * 0.12}s` }}
              />
              <text
                x={cx + (c.left ? -6 : 6)}
                y={cy + 3.5 + (c.dy ?? 0)}
                textAnchor={c.left ? "end" : "start"}
                className="fill-[var(--muted)] font-sans"
                fontSize="10"
                style={{ opacity: on ? 1 : 0, transition: `opacity .4s ${1 + i * 0.12}s` }}
              >
                {c.name}
              </text>
            </g>
          );
        })}
        <circle cx={px} cy={py} r="6" fill="#6a46ff" stroke="white" strokeWidth="2" />
        <circle cx={px} cy={py} r="6" fill="none" stroke="#6a46ff" strokeWidth="2" className="motion-safe:animate-ping" style={{ transformOrigin: `${px}px ${py}px` }} />
        <text x={px - 10} y={py + 4} textAnchor="end" fontSize="12" fontWeight="700" className="fill-[var(--foreground)]">
          Pune
        </text>
      </svg>
      <p className="relative mt-1 text-center text-[0.8rem] text-muted">Based in Pune — working with clients across India</p>
    </div>
  );
}
