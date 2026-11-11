"use client";

import { useEffect } from "react";
import { sound } from "@/lib/sound";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** #25 — confetti burst from a point (DOM + Web Animations, cleans itself up). */
export function burstConfetti(x: number, y: number, count = 90) {
  if (typeof window === "undefined" || reduced()) return;
  const colors = ["#6a46ff", "#3d63ff", "#c026d3", "#22d3ee", "#ffd166", "#16a34a", "#ff7ab6"];
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden";
  document.body.appendChild(layer);
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const w = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w * (Math.random() < 0.5 ? 0.45 : 1)}px;background:${colors[i % colors.length]};border-radius:${Math.random() < 0.3 ? "50%" : "2px"}`;
    layer.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const v = 140 + Math.random() * 320;
    const dx = Math.cos(angle) * v;
    const dy = Math.sin(angle) * v - 240;
    p.animate(
      [
        { transform: "translate(-50%,-50%) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx * 1.2}px, ${dy + 520}px) rotate(${Math.random() * 1080}deg)`, opacity: 0 },
      ],
      { duration: 1500 + Math.random() * 900, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" },
    );
  }
  window.setTimeout(() => layer.remove(), 2600);
}

/** Small toast for the easter egg. */
function toast(msg: string) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText =
    "position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:9999;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,#6a46ff,#c026d3);color:#fff;font:600 14px var(--font-sans);box-shadow:0 20px 50px -15px rgba(106,70,255,.7)";
  document.body.appendChild(t);
  t.animate([{ opacity: 0, transform: "translate(-50%,20px)" }, { opacity: 1, transform: "translate(-50%,0)" }], { duration: 300, fill: "forwards" });
  window.setTimeout(() => {
    t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
    window.setTimeout(() => t.remove(), 320);
  }, 2400);
}

/**
 * Page-wide effects:
 *  #15 magnetic cards ([data-magnetic]) lean toward the cursor
 *  #26 easter egg — type "ss" anywhere (outside fields) to spin the logo
 *  #28 dot-grid ripple from wherever you click on empty space
 */
export function GlobalFx() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // ---- host badge: Netlify's free plan pins a required "Powered by Netlify"
    // badge (iframe, ~200x64) to the bottom-right corner. When it's there, flag
    // <html> so our fixed buttons move out of its way (see .has-host-badge CSS).
    const flagBadge = () => {
      const on = !!document.querySelector('iframe[title="Powered by Netlify"]');
      document.documentElement.classList.toggle("has-host-badge", on);
      return on;
    };
    const badgeObs = new MutationObserver(() => {
      if (flagBadge()) badgeObs.disconnect();
    });
    if (!flagBadge()) {
      badgeObs.observe(document.body, { childList: true });
      window.setTimeout(() => badgeObs.disconnect(), 20000);
    }

    // ---- #15 magnetic cards ----
    let mag: HTMLElement | null = null;
    let raf = 0;
    let ev: PointerEvent | null = null;
    const applyMag = () => {
      raf = 0;
      if (!ev) return;
      const el = (ev.target as Element | null)?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (mag && mag !== el) mag.style.transform = "";
      mag = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (ev.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (ev.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = `perspective(800px) translate3d(${dx * 10}px, ${dy * 10}px, 0) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
    };
    const onMove = (e: PointerEvent) => {
      ev = e;
      if (!raf) raf = requestAnimationFrame(applyMag);
    };
    if (fine && !reduced()) document.addEventListener("pointermove", onMove, { passive: true });

    // ---- #26 easter egg ----
    let buf = "";
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-2);
      if (buf === "ss") {
        buf = "";
        document.querySelectorAll<HTMLElement>("[data-logo-mark]").forEach((m) => {
          m.animate([{ transform: "rotate(0) scale(1)" }, { transform: "rotate(360deg) scale(1.6)" }, { transform: "rotate(720deg) scale(1)" }], {
            duration: 1100,
            easing: "cubic-bezier(.22,1,.36,1)",
          });
        });
        window.dispatchEvent(new Event("ss:hero-poke"));
        sound.play("success");
        burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 60);
        toast("✨ You found the SS easter egg!");
      }
    };
    window.addEventListener("keydown", onKey);

    // ---- #28 click ripple on empty space ----
    const onClick = (e: MouseEvent) => {
      if (reduced()) return;
      const t = e.target as Element | null;
      if (t?.closest?.('a, button, input, textarea, select, label, [role="button"], [role="tab"], [role="dialog"], canvas, img, video, [data-no-ripple]')) return;
      const size = 360;
      const r = document.createElement("span");
      r.setAttribute("aria-hidden", "true");
      r.className = "dot-ripple";
      r.style.left = `${e.clientX - size / 2}px`;
      r.style.top = `${e.clientY - size / 2}px`;
      document.body.appendChild(r);
      window.setTimeout(() => r.remove(), 950);
    };
    document.addEventListener("click", onClick);

    return () => {
      badgeObs.disconnect();
      document.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
