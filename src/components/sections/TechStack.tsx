import { technologies } from "@/data/technologies";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TechSphere } from "@/components/ui/TechSphere";
import type { TechItem } from "@/types";
import { Decor } from "@/components/graphics/Decor";
import { FallList } from "@/components/fx/FallList";

/** Very dark brand colours (Next.js, Vercel, Express…) would vanish in dark mode. */
function isDark(hex: string) {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 60;
}

function TechChip({ item, i = 0 }: { item: TechItem; i?: number }) {
  const brand = item.icon && !isDark(item.icon.hex) ? `#${item.icon.hex}` : "var(--foreground)";
  return (
    <li
      className="group/chip flex items-center gap-2.5 rounded-full border border-border bg-background/60 py-1.5 pl-2 pr-3.5 text-[0.84rem] text-muted-strong transition-[border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:text-foreground"
      style={{ ["--brand" as string]: brand, ["--i" as string]: i }}
    >
      {item.icon ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="h-4 w-4 shrink-0 fill-[var(--faint)] transition-[fill] duration-300 group-hover/chip:fill-[var(--brand)]"
        >
          <path d={item.icon.path} />
        </svg>
      ) : (
        <span aria-hidden className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[0.55rem] font-semibold text-muted">
          {item.name.charAt(0)}
        </span>
      )}
      {item.name}
    </li>
  );
}

export function TechStack() {
  return (
    <section id="tech" className="section tinted tint-peach relative isolate">
      <Decor preset="tech" />
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <SectionHeading
            index="07"
            eyebrow="Stack"
            title={"The tools we\nactually ship with"}
            lead="The stack behind our delivered projects — Spring Boot hiring platforms, React Native apps, PyTorch models, Solidity contracts — and the tools we use every day."
          />
          <div className="mx-auto w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px]">
            <TechSphere />
            <p className="mt-3 text-center text-[0.78rem] text-faint">
              <span className="hidden md:inline">Move your mouse or drag to spin</span>
              <span className="md:hidden">Drag to spin</span>
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {technologies.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <ScrollReveal
                key={cat.id}
                delay={(i % 4) * 0.06}
                className="flex flex-col rounded-[22px] border border-border bg-surface p-5 shadow-[var(--card-shadow)] sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--purple)_12%,transparent)] text-purple-light">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="t-label text-muted-strong">{cat.label}</span>
                </div>
                <FallList className="mt-5 flex flex-wrap gap-2">
                  {cat.items.map((item, k) => (
                    <TechChip key={item.name} item={item} i={k} />
                  ))}
                </FallList>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
