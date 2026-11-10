"use client";

import { Suspense, type ReactNode, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from "@react-three/drei";
import { useIsMobile } from "@/hooks/useMediaQuery";

export interface SceneCameraConfig {
  position?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
}

interface SceneCanvasProps {
  children: ReactNode;
  className?: string;
  camera?: SceneCameraConfig;
  /** Stop rendering (keeps the GL context) while off-screen. */
  paused?: boolean;
}

/**
 * Shared R3F canvas.
 * - DPR capped (lower on mobile) and adaptive under load.
 * - Transparent — the CSS layers behind show through.
 * - ACES tone mapping + slightly lifted exposure for a filmic, premium read.
 */
export function SceneCanvas({ children, className, camera, paused = false }: SceneCanvasProps) {
  const isMobile = useIsMobile();
  const [degraded, setDegraded] = useState(false);
  const maxDpr = isMobile ? 1.2 : degraded ? 1.25 : 1.75;

  return (
    <div className={className}>
      <Canvas
        frameloop={paused ? "never" : "always"}
        dpr={[1, maxDpr]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
        camera={{
          position: camera?.position ?? [0, 0, 9],
          fov: camera?.fov ?? 40,
          near: camera?.near ?? 0.1,
          far: camera?.far ?? 100,
        }}
      >
        <PerformanceMonitor onDecline={() => setDegraded(true)} flipflops={3} />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
