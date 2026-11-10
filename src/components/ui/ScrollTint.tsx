"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * While a `.tinted` section (lavender / mint / peach) fills most of the
 * screen, the page background eases to the same colour, so sections blend
 * into each other instead of meeting at hard edges.
 */
export function ScrollTint() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".tinted"));
    if (!sections.length) return;
    let current: string | null = null;
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      // a tinted section "owns" the page when it covers the middle 40% band
      const hit = sections.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top < vh * 0.3 && r.bottom > vh * 0.7;
      });
      const tint = hit ? Array.from(hit.classList).find((c) => c.startsWith("tint-")) ?? null : null;
      if (tint === current) return;
      current = tint;
      if (tint) root.style.setProperty("--page-tint", `var(--${tint})`);
      else root.style.removeProperty("--page-tint");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.style.removeProperty("--page-tint");
    };
  }, [pathname]);

  return null;
}
