"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/** Sun / moon switch between the light (default) and dark themes. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  // #23 the new theme spreads out in a circle from this button (View Transitions API)
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      toggle();
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.classList.add("vt-theme");
    const vt = doc.startViewTransition(() => toggle());
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" },
      ).finished.finally(() => document.documentElement.classList.remove("vt-theme"));
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      data-sound="none"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-border text-foreground transition-colors hover:border-border-strong hover:bg-[rgba(var(--ink-rgb),0.05)]",
        className,
      )}
    >
      <Sun
        aria-hidden
        className={cn(
          "absolute h-[18px] w-[18px] transition-all duration-500 ease-[var(--ease)]",
          dark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          "absolute h-[17px] w-[17px] transition-all duration-500 ease-[var(--ease)]",
          dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
      />
    </button>
  );
}
