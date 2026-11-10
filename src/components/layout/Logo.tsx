import { cn } from "@/lib/utils";

/**
 * Wordmark. Monochrome except for one small violet node — the only brand
 * colour in the navbar until you reach the CTA.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        data-logo-mark
        className="shrink-0"
      >
        <rect
          x="8"
          y="0.7"
          width="10.3"
          height="10.3"
          rx="2"
          transform="rotate(45 8 0.7)"
          stroke="var(--purple)"
          strokeWidth="1.4"
        />
        <rect
          x="8"
          y="4.6"
          width="4.8"
          height="4.8"
          rx="1"
          transform="rotate(45 8 4.6)"
          fill="var(--purple)"
        />
      </svg>
      <span className="font-display text-[15px] tracking-[-0.02em] text-foreground">
        <span className="font-semibold">SS</span>{" "}
        <span className="font-normal text-muted-strong">Solutions</span>
      </span>
    </span>
  );
}
