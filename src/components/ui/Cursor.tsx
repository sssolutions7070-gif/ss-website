"use client";

import { useEffect, useRef } from "react";
import { useHasPointer } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const svg = (d: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const CURSOR_ICONS: Record<string, string> = {
  pencil: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
  code: svg('<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>'),
  rocket: svg('<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2Z"/>'),
  sparkle: svg('<path d="M12 3l1.9 5.8L20 10.7l-6.1 1.9L12 18.5l-1.9-5.9L4 10.7l6.1-1.9Z"/>'),
  mail: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'),
};

/**
 * Subtle futuristic cursor: a small dot + a trailing glow ring that
 * grows over interactive elements. Desktop pointers only.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const icon = useRef<HTMLDivElement>(null);
  const hasPointer = useHasPointer();
  const reduced = useReducedMotion();
  const enabled = hasPointer && !reduced;

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("custom-cursor-active");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;
    let hovering = false;
    let text = "";

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      // wake the render loop (it sleeps once the ring has caught up)
      if (!raf && !document.hidden) raf = requestAnimationFrame(render);
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`;
      }
      const t = e.target as HTMLElement;
      hovering = !!t.closest(
        'a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]',
      );
      // #24 a small icon follows the cursor in themed sections
      const ic = t.closest<HTMLElement>("[data-cursor-icon]")?.dataset.cursorIcon ?? "";
      if (icon.current && icon.current.dataset.icon !== ic) {
        icon.current.dataset.icon = ic;
        icon.current.innerHTML = ic ? CURSOR_ICONS[ic] ?? "" : "";
        icon.current.style.opacity = ic ? "1" : "0";
      }
      if (icon.current) icon.current.style.transform = `translate3d(${pos.x + 14}px, ${pos.y + 12}px, 0)`;
      const labelled = t.closest<HTMLElement>("[data-cursor-label]");
      const next = labelled?.dataset.cursorLabel ?? "";
      if (next !== text) {
        text = next;
        if (label.current) {
          label.current.textContent = text;
          label.current.style.opacity = text ? "1" : "0";
        }
      }
    };

    const render = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      const scale = text ? 0 : hovering ? 1.7 : 1;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x - 16}px, ${ringPos.y - 16}px, 0) scale(${scale})`;
        ring.current.style.opacity = text ? "0" : hovering ? "0.8" : "0.4";
      }
      if (label.current) {
        label.current.style.transform = `translate3d(${ringPos.x - 40}px, ${ringPos.y - 40}px, 0) scale(${text ? 1 : 0.3})`;
      }
      if (dot.current) dot.current.style.opacity = text ? "0" : "1";
      // idle: stop the loop when the ring has settled on the pointer
      if (Math.abs(pos.x - ringPos.x) < 0.1 && Math.abs(pos.y - ringPos.y) < 0.1) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(render);
    };
    render();

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        raf = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onLeave = () => {
      if (dot.current) dot.current.style.opacity = "0";
      if (ring.current) ring.current.style.opacity = "0";
    };
    const onEnter = () => {
      if (dot.current) dot.current.style.opacity = "1";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.removeEventListener("visibilitychange", onVisibility);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={ring}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border border-[rgba(var(--ink-rgb),0.35)] transition-[opacity,transform] duration-200 ease-out will-change-transform"
        style={{ backgroundColor: "rgba(var(--ink-rgb),0.04)" }}
      />
      <div
        ref={icon}
        className="absolute left-0 top-0 grid h-7 w-7 place-items-center rounded-full bg-purple text-white opacity-0 shadow-[0_8px_20px_-6px_var(--glow)] transition-opacity duration-200 will-change-transform [&_svg]:h-3.5 [&_svg]:w-3.5"
      />
      <div
        ref={label}
        className="absolute left-0 top-0 grid h-20 w-20 place-items-center rounded-full bg-purple text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-white opacity-0 shadow-[0_10px_30px_-8px_var(--glow)] transition-[opacity] duration-200 will-change-transform"
      />
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-foreground will-change-transform"
      />
    </div>
  );
}
