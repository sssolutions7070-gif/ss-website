/** Shared design + motion constants. */

export const BRAND_COLORS = {
  background: "#05060f",
  surface: "#0e1024",
  purple: "#8b5cf6",
  purpleLight: "#c4b5fd",
  violet: "#6d28d9",
  blue: "#4f6bff",
  foreground: "#f5f6ff",
} as const;

/** Tailwind-ish breakpoints in px, used by useMediaQuery helpers. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** Standard easing curves (GSAP + CSS). */
export const EASE = {
  out: "power3.out",
  inOut: "power2.inOut",
  expo: "expo.out",
  cssOut: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/** Section ids — keep in sync with navigation.ts anchors. */
export const SECTION_IDS = [
  "home",
  "positioning",
  "services",
  "work",
  "marketing",
  "consultancy",
  "process",
  "about",
  "tech",
  "cta",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
