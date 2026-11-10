"use client";

import {
  useRef,
  type ReactNode,
  type RefObject,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { ArrowRight } from "lucide-react";
import { useHasPointer } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollTo } from "@/hooks/useLenis";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  withArrow?: boolean;
  ariaLabel?: string;
}

/**
 * The conversion button. One shape, two weights:
 *  - primary   → solid violet, the single loudest element on any screen
 *  - secondary → hairline outline, quiet companion
 * Magnetic pull + arrow nudge on fine pointers; inert on touch / reduced-motion.
 * In-page hash hrefs scroll smoothly via Lenis.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  withArrow = true,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const hasPointer = useHasPointer();
  const reduced = useReducedMotion();
  const scrollTo = useScrollTo();
  const magnetic = hasPointer && !reduced;

  const onMove = (e: ReactMouseEvent) => {
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    ref.current.style.transform = `translate(${x * 0.14}px, ${y * 0.22}px)`;
  };

  const reset = (e?: ReactMouseEvent) => {
    if (ref.current) ref.current.style.transform = "";
    if (e) setFillOrigin(e);
  };
  // #16 liquid fill grows from wherever the mouse entered / leaves
  const setFillOrigin = (e: ReactMouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--fx", `${e.clientX - r.left}px`);
    el.style.setProperty("--fy", `${e.clientY - r.top}px`);
  };

  const handleClick = (e: ReactMouseEvent) => {
    if (href?.startsWith("#")) {
      e.preventDefault();
      scrollTo(href, -88);
    }
    onClick?.();
  };

  const base = cn(
    "liquid group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium",
    "transition-[transform,background-color,border-color,box-shadow] duration-300 ease-[var(--ease)] will-change-transform",
    size === "md" ? "px-6 py-3 text-[0.9rem]" : "px-8 py-4 text-[0.95rem]",
    variant === "primary" &&
      "bg-purple text-white shadow-[0_8px_30px_-10px_var(--glow)] hover:bg-[color-mix(in_oklab,var(--purple)_88%,white)] hover:shadow-[0_14px_44px_-10px_var(--glow)]",
    variant === "secondary" &&
      "liquid-secondary border border-border-strong bg-transparent text-foreground hover:border-purple hover:text-white",
    className,
  );

  const content = (
    <>
      {/* label rolls up on hover: a second copy slides in from below */}
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-[var(--ease)] group-hover:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease)] group-hover:translate-y-0 motion-reduce:hidden"
        >
          {children}
        </span>
      </span>
      {withArrow && (
        <ArrowRight className="h-[1.05em] w-[1.05em] transition-transform duration-300 ease-[var(--ease)] group-hover:translate-x-1" />
      )}
    </>
  );

  const shared = {
    className: base,
    onMouseMove: onMove,
    onMouseEnter: setFillOrigin,
    onMouseLeave: reset,
    onClick: handleClick,
    "aria-label": ariaLabel,
  };

  if (href) {
    return (
      <a ref={ref as RefObject<HTMLAnchorElement>} href={href} {...shared}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref as RefObject<HTMLButtonElement>} type="button" {...shared}>
      {content}
    </button>
  );
}
