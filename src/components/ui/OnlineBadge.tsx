"use client";

import { useEffect, useState } from "react";
import { isOpen, nextOpenLabel } from "@/lib/hours";
import { cn } from "@/lib/utils";

/**
 * "Online now" during working hours (IST), otherwise "Replies by 10 AM tomorrow".
 * Rendered after mount only, so server and client HTML always match.
 */
export function OnlineBadge({ className }: { className?: string }) {
  const [state, setState] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => {
    const update = () => setState({ open: isOpen(), label: nextOpenLabel() });
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!state) return <span className={cn("inline-block h-[30px]", className)} aria-hidden />;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.78rem] font-medium",
        state.open
          ? "border-[#16a34a]/30 bg-[#16a34a]/10 text-[#15803d] dark:text-[#4ade80]"
          : "border-border-strong bg-surface text-muted-strong",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        {state.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-70" />}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", state.open ? "bg-[#22c55e]" : "bg-[#f59e0b]")} />
      </span>
      {state.open ? "Online now — usually replies in minutes" : state.label}
    </span>
  );
}
