"use client";

import { SceneMount } from "./SceneMount";
import { ParticleLogo } from "./ParticleLogo";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/useMediaQuery";

/**
 * Closing-section scene: the "SS" mark built from particles. They gather as the
 * section reaches the centre of the screen and scatter as it leaves.
 * Load via `next/dynamic` (`ssr: false`).
 */
export function CtaBackdrop({ className }: { className?: string }) {
  const light = useTheme().theme === "light";
  const isMobile = useIsMobile();
  return (
    <SceneMount className={className} camera={{ position: [0, 0, 10], fov: 40 }}>
      <ParticleLogo light={light} count={isMobile ? 2400 : 6000} />
    </SceneMount>
  );
}
