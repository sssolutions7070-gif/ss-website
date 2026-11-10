"use client";

import dynamic from "next/dynamic";
import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCan3D } from "@/hooks/useCan3D";
import { useSceneVisibility } from "@/hooks/useSceneVisibility";
import type { SceneCameraConfig } from "./SceneCanvas";

const SceneCanvas = dynamic(
  () => import("./SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);

interface SceneMountProps {
  children: ReactNode;
  className?: string;
  camera?: SceneCameraConfig;
  /** Start loading this many px before entering the viewport. */
  rootMargin?: string;
}

/**
 * Generic lazy 3D mount for decorative section backgrounds.
 * - SSR-safe (canvas never renders on the server)
 * - skipped entirely under prefers-reduced-motion
 * - only mounts while near/in the viewport, unmounts when far away
 */
export function SceneMount({
  children,
  className,
  camera,
  rootMargin = "300px",
}: SceneMountProps) {
  const reduced = useReducedMotion();
  const can3D = useCan3D();
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, active } = useSceneVisibility(ref);
  void rootMargin;


  return (
    <div ref={ref} className={className} aria-hidden>
      {!reduced && can3D && mounted && (
        <SceneCanvas className="h-full w-full" camera={camera} paused={!active}>
          {children}
        </SceneCanvas>
      )}
    </div>
  );
}
