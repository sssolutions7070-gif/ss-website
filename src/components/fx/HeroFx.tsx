"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHasPointer } from "@/hooks/useMediaQuery";

/** #4 — violet sparks trail the cursor inside the hero (desktop, 2D canvas, idle when still). */
export function HeroSparks() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const hasPointer = useHasPointer();

  useEffect(() => {
    const c = canvas.current;
    const host = c?.parentElement;
    if (!c || !host || reduced || !hasPointer) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      c.width = host.clientWidth * dpr;
      c.height = host.clientHeight * dpr;
    };
    size();
    const parts: { x: number; y: number; vx: number; vy: number; life: number; hue: number; r: number }[] = [];
    let raf = 0;
    let last = { x: -1, y: -1 };
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= 0.022;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = `hsl(${p.hue} 90% 65%)`;
        ctx.beginPath();
        ctx.arc(p.x * dpr, p.y * dpr, p.r * p.life * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const d = last.x < 0 ? 0 : Math.hypot(x - last.x, y - last.y);
      last = { x, y };
      const n = Math.min(4, Math.floor(d / 8));
      for (let i = 0; i < n && parts.length < 120; i++) {
        parts.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.4,
          life: 1,
          hue: 255 + Math.random() * 60, // violet → magenta
          r: 1.5 + Math.random() * 2.2,
        });
      }
      if (!raf && parts.length) raf = requestAnimationFrame(tick);
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", size);
    return () => {
      host.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", size);
      cancelAnimationFrame(raf);
    };
  }, [reduced, hasPointer]);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 z-[1] h-full w-full" />;
}

/** #20 — "We build ___" typewriter cycling through what we make. */
const WORDS = ["websites", "mobile apps", "AI agents", "automation", "games", "e-commerce"];
export function Typewriter({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [text, setText] = useState(WORDS[0]);
  useEffect(() => {
    if (reduced) return;
    let w = 0;
    let i = WORDS[0].length;
    let deleting = true;
    let timer = 0;
    const step = () => {
      const word = WORDS[w];
      if (deleting) {
        i -= 1;
        if (i <= 0) {
          deleting = false;
          w = (w + 1) % WORDS.length;
        }
      } else {
        i += 1;
        if (i >= WORDS[w].length) {
          deleting = true;
          setText(WORDS[w]);
          timer = window.setTimeout(step, 1600);
          return;
        }
      }
      setText((deleting ? word : WORDS[w]).slice(0, Math.max(0, i)));
      timer = window.setTimeout(step, deleting ? 45 : 85);
    };
    timer = window.setTimeout(step, 2200);
    return () => window.clearTimeout(timer);
  }, [reduced]);
  return (
    <span className={className}>
      We build{" "}
      <span className="font-semibold text-purple">
        {text}
        <span aria-hidden className="type-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-purple" />
      </span>
    </span>
  );
}

/** #27 — animated mouse "scroll to explore" hint; fades out once you scroll. */
export function ScrollHint() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const on = () => window.scrollY > 40 && setGone(true);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-500 md:flex ${gone ? "opacity-0" : "opacity-100"}`}
    >
      <span className="relative h-9 w-[22px] rounded-full border-2 border-[rgba(var(--ink-rgb),0.35)]">
        <span className="scroll-wheel absolute left-1/2 top-1.5 h-2 w-[3px] -translate-x-1/2 rounded-full bg-purple" />
      </span>
      <span className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.25em] text-faint">Scroll to explore</span>
    </div>
  );
}
