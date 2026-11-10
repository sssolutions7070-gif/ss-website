"use client";

import { useEffect, useMemo, useRef } from "react";
import { technologies } from "@/data/technologies";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { sound } from "@/lib/sound";

/** Very dark brand colours (Next.js, Vercel…) would vanish in dark mode. */
function brandColor(hex: string) {
  const n = Number.parseInt(hex, 16);
  const lum = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum < 60 ? "var(--foreground)" : `#${hex}`;
}

/**
 * A 3D sphere of technology logos (CSS 3D, no WebGL — light on phones).
 * Auto-rotates; pointer position steers it, drag spins it.
 */
export function TechSphere() {
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);

  const items = useMemo(
    () =>
      technologies
        .flatMap((c) => c.items)
        .filter((i, idx, arr) => i.icon && arr.findIndex((x) => x.icon?.path === i.icon?.path) === idx),
    [],
  );

  // Fibonacci sphere: evenly spread points.
  const points = useMemo(
    () =>
      items.map((_, i) => {
        const y = 1 - (i / (items.length - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = i * Math.PI * (3 - Math.sqrt(5));
        return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
      }),
    [items],
  );

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let ax = 0.35, ay = 0; // current angles
    let vx = 0.0012, vy = 0.0035; // angular velocity
    let tx = vx, ty = vy;
    let dragging = false, lx = 0, ly = 0;
    let raf = 0;
    let visible = true;

    const render = () => {
      const R = el.clientWidth * 0.4;
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
      points.forEach((p, i) => {
        const n = nodes.current[i];
        if (!n) return;
        // rotate around Y then X
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 back .. 1 front
        n.style.transform = `translate3d(${x1 * R}px, ${y2 * R}px, 0) scale(${0.55 + depth * 0.6})`;
        n.style.opacity = String(0.18 + depth * 0.82);
        n.style.zIndex = String(Math.round(depth * 100));
        n.style.filter = depth < 0.35 ? "blur(1px)" : "none";
      });
    };

    const tick = () => {
      if (!dragging) {
        vx += (tx - vx) * 0.04;
        vy += (ty - vy) * 0.04;
      }
      ax += vx;
      ay += vy;
      render();
      if (visible) raf = requestAnimationFrame(tick);
    };

    render();
    if (reduced) return;

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(el);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      if (dragging) {
        // sound: spinning whirr follows drag speed
        sound.loop("whirr", Math.min(1, Math.hypot(e.clientX - lx, e.clientY - ly) / 25));
        vy = (e.clientX - lx) * 0.004;
        vx = -(e.clientY - ly) * 0.004;
        lx = e.clientX;
        ly = e.clientY;
      } else {
        ty = 0.0035 + nx * 0.02;
        tx = 0.0012 - ny * 0.02;
      }
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const onUp = () => {
      sound.loop("whirr", 0);
      dragging = false;
      tx = 0.0012;
      ty = 0.0035;
    };
    const onLeave = () => {
      tx = 0.0012;
      ty = 0.0035;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [points, reduced]);

  return (
    <div
      ref={stage}
      role="img"
      aria-label={`Sphere of technologies we use: ${items.map((i) => i.name).join(", ")}`}
      className="relative mx-auto aspect-square w-full max-w-[460px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
    >
      {/* soft core glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[18%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--purple)_22%,transparent),transparent_70%)] blur-xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[9%] rounded-full border border-dashed border-border-strong opacity-60"
      />
      {items.map((item, i) => (
        <div
          key={item.name}
          ref={(n) => {
            nodes.current[i] = n;
          }}
          aria-hidden
          className="absolute left-1/2 top-1/2 -ml-[18px] -mt-[18px] grid h-9 w-9 place-items-center rounded-xl sm:-ml-6 sm:-mt-6 sm:h-12 sm:w-12 sm:rounded-2xl border border-border bg-surface shadow-[var(--card-shadow)] will-change-transform"
          title={item.name}
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] sm:h-6 sm:w-6" style={{ fill: brandColor(item.icon!.hex) }}>
            <path d={item.icon!.path} />
          </svg>
        </div>
      ))}
    </div>
  );
}
