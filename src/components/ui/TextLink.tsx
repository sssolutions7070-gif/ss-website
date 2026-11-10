"use client";

import { type ReactNode, type MouseEvent as ReactMouseEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useScrollTo } from "@/hooks/useLenis";
import { cn } from "@/lib/utils";

interface TextLinkProps {
  children: ReactNode;
  href: string;
  className?: string;
  /** Show the trailing arrow (default true). */
  arrow?: boolean;
}

/**
 * Quiet tertiary action — an underlined text link with a sliding arrow.
 * Used where a full button would be too loud (in-section nudges, "see more").
 */
export function TextLink({ children, href, className, arrow = true }: TextLinkProps) {
  const scrollTo = useScrollTo();

  const onClick = (e: ReactMouseEvent) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollTo(href, -88);
    }
  };

  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "group -my-2.5 inline-flex items-center gap-1.5 py-2.5 text-[0.9rem] font-medium text-foreground",
        className,
      )}
    >
      <span className="link-underline">{children}</span>
      {arrow && (
        <ArrowRight className="h-4 w-4 text-muted transition-transform duration-300 ease-[var(--ease)] group-hover:translate-x-1 group-hover:text-foreground" />
      )}
    </a>
  );
}
