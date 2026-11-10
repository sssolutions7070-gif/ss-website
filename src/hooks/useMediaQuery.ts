"use client";

import { useEffect, useState } from "react";
import { BREAKPOINTS } from "@/lib/constants";

/**
 * SSR-safe media query hook. Returns `false` on the server and first client render,
 * then updates after mount to avoid hydration mismatches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** true when viewport width is below the `md` breakpoint. */
export const useIsMobile = () =>
  useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);

/** true for fine pointers (mouse) — used to gate the custom cursor & hover FX. */
export const useHasPointer = () =>
  useMediaQuery("(hover: hover) and (pointer: fine)");
