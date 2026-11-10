"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Two-stage visibility for WebGL scenes:
 * - `mounted`: true once the element is within ~1 viewport, and stays true until
 *   it is more than ~2 viewports away (avoids re-creating the GL context — and
 *   the shader-compile stutter — every time you scroll back and forth).
 * - `active`: true only while actually on screen; when false the scene pauses.
 */
export function useSceneVisibility(ref: RefObject<HTMLElement | null>) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setMounted(true);
    }, { rootMargin: "100% 0px" });
    const far = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) setMounted(false);
    }, { rootMargin: "200% 0px" });
    const onScreen = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "60px 0px" });
    near.observe(el);
    far.observe(el);
    onScreen.observe(el);
    return () => {
      near.disconnect();
      far.disconnect();
      onScreen.disconnect();
    };
  }, [ref]);

  return { mounted, active };
}
