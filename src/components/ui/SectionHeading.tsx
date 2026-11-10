import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedHeading } from "./AnimatedHeading";
import { Scramble } from "@/components/fx/Scramble";

interface SectionHeadingProps {
  /** Two-digit section index, e.g. "03". Rendered in the accent. */
  index?: string;
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  /** Optional trailing action (e.g. a <TextLink/>), shown right-aligned on desktop. */
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
}

/**
 * Consistent section header. Deliberately restrained: a mono index + label,
 * one large heading, one line of lead copy. No decorative dots.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  action,
  align = "left",
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div
        className={cn(
          "flex max-w-2xl flex-col gap-4",
          align === "center" && "mx-auto items-center text-center",
        )}
      >
        {(index || eyebrow) && (
          <span className="eyebrow">
            {index && <span className="text-purple-light">{index}</span>}
            {index && eyebrow && (
              <span className="text-border-strong">/</span>
            )}
            {eyebrow && <Scramble text={eyebrow} />}
          </span>
        )}
        <AnimatedHeading as="h2" id={id} text={title} className="t-h2 text-foreground" />
        {lead && (
          <p className="t-lead max-w-xl text-balance">{lead}</p>
        )}
      </div>
      {action && <div className="shrink-0 md:pb-2">{action}</div>}
    </div>
  );
}
