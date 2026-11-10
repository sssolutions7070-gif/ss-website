"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * true when the user has requested reduced motion.
 * Gate heavy 3D, parallax and non-essential animation behind this.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
