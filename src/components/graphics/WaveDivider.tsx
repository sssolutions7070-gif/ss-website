"use client";

import { useEffect, useRef, useState } from "react";

/** A gradient wave line that draws itself across the page when it scrolls in. */
export function WaveDivider({ flip = false }: { flip?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const id = flip ? "wave-b" : "wave-a";
  return (
    <div ref={ref} aria-hidden className={`container-page py-2 ${inView ? "wave-in" : ""}`}>
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className={`h-10 w-full md:h-14 ${flip ? "-scale-x-100" : ""}`}>
        <defs>
          <linearGradient id={id} x1="0" x2="1">
            <stop offset="0" stopColor="#6a46ff" stopOpacity="0" />
            <stop offset="0.2" stopColor="#6a46ff" />
            <stop offset="0.55" stopColor="#3d63ff" />
            <stop offset="0.8" stopColor="#c026d3" />
            <stop offset="1" stopColor="#c026d3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="wave-path"
          pathLength={1}
          d="M0 30 C 150 0, 300 60, 450 30 S 750 0, 900 30 S 1100 55, 1200 30"
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
