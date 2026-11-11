"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCan3D } from "@/hooks/useCan3D";
import { useSceneVisibility } from "@/hooks/useSceneVisibility";

const SceneCanvas = dynamic(
  () => import("./SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);
const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), {
  ssr: false,
});

/**
 * true once the visitor first moves the mouse, scrolls or touches — or after
 * 5 s. The heavy 3D start-up then never competes with the first paint.
 */
function useIdleReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const EVENTS = ["pointermove", "scroll", "touchstart", "keydown", "wheel"] as const;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      cleanup();
      setReady(true);
    };
    const timer = window.setTimeout(go, 5000);
    const cleanup = () => {
      window.clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, go));
    };
    EVENTS.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    return cleanup;
  }, []);
  return ready;
}

/**
 * Lazy hero 3D:
 * - never SSR'd (dynamic, ssr:false)
 * - phones included, at a lighter quality (lower resolution, smaller mark)
 * - loads after the page is idle, so text and buttons appear first
 * - skipped under prefers-reduced-motion or without a real GPU
 * - pauses off-screen, unmounted once scrolled well past
 */
export function HeroCanvas() {
  const reduced = useReducedMotion();
  const can3D = useCan3D();
  const idle = useIdleReady();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { mounted, active } = useSceneVisibility(wrapRef);

  return (
    <div ref={wrapRef} className="absolute inset-0 -z-10" aria-hidden>
      {/* CSS layer — off-centre violet wash + faint grid, right-weighted */}
      <div className="grid-backdrop absolute inset-0 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_82%_38%,color-mix(in_oklab,var(--purple)_22%,transparent),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_65%_85%,color-mix(in_oklab,var(--blue)_12%,transparent),transparent_70%)]" />
      <div className="hero-mesh absolute inset-0 transition-opacity duration-500" />

      {!reduced && can3D && idle && mounted && (
        <SceneCanvas className="absolute inset-0 animate-[fade-in_0.8s_ease_both]" paused={!active}>
          <HeroScene />
        </SceneCanvas>
      )}
    </div>
  );
}
