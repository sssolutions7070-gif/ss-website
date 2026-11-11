"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import { ArrowUpRight, Images } from "lucide-react";
import type { Project, ProjectImage } from "@/types";
import { cn } from "@/lib/utils";
import { useHasPointer } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function projectImages(project: Project): ProjectImage[] {
  return project.gallery && project.gallery.length > 0
    ? project.gallery
    : [{ src: project.image, alt: project.title }];
}

/**
 * Media area of a card. Web projects show one large screenshot; projects whose
 * cover is a phone screen show up to three phones side by side.
 */
function CardMedia({ project, large }: { project: Project; large?: boolean }) {
  const images = projectImages(project);
  const phones = images.filter((i) => i.portrait);
  const cover = images[0];
  const accent = project.accent ?? "#7c5cff";

  if (cover.portrait && phones.length > 0) {
    const shown = phones.slice(0, 3);
    return (
      <div
        className="img-focus relative flex h-full w-full items-end justify-center gap-[4%] overflow-hidden px-[8%] pt-[7%]"
        style={{
          background: `radial-gradient(120% 90% at 50% 0%, ${accent}33, transparent 65%)`,
        }}
      >
        {shown.map((img, i) => (
          <div
            key={img.src}
            className={cn(
              "relative aspect-[9/19.5] w-[27%] shrink-0 overflow-hidden rounded-[14px] border border-white/15 bg-black shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-[var(--ease)]",
              i === 1 ? "translate-y-[2%] group-hover:-translate-y-[3%]" : "translate-y-[12%] group-hover:translate-y-[7%]",
            )}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes={large ? "220px" : "140px"}
              className="object-cover object-top"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="img-focus relative h-full w-full overflow-hidden">
      <Image
        src={cover.src}
        alt={cover.alt}
        fill
        priority={large}
        sizes={large ? "(max-width: 1024px) 100vw, 760px" : "(max-width: 768px) 100vw, 420px"}
        className="object-cover object-top transition-transform duration-[1.2s] ease-[var(--ease)] group-hover:scale-[1.04]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.28),transparent_40%)]" />
      {large && phones.length > 0 && (
        <div className="pointer-events-none absolute bottom-[6%] right-[5%] hidden items-end gap-3 sm:flex">
          {phones.slice(0, 2).map((img, i) => (
            <div
              key={img.src}
              className={cn(
                "relative aspect-[9/19.5] w-[clamp(84px,11vw,150px)] overflow-hidden rounded-[16px] border-[3px] border-[#1c1c22] bg-black shadow-[0_30px_60px_-10px_rgba(0,0,0,0.85)] transition-transform duration-700 ease-[var(--ease)]",
                i === 0 ? "-rotate-3 group-hover:-translate-y-2" : "translate-y-[-14%] rotate-2 group-hover:-translate-y-[20%]",
              )}
            >
              <Image src={img.src} alt="" fill sizes="150px" className="object-cover object-top" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Clickable project tile. Opens the project viewer via `onOpen`.
 * `large` renders the featured, wide layout.
 */
export function ProjectCard({
  project,
  onOpen,
  large = false,
}: {
  project: Project;
  onOpen: () => void;
  large?: boolean;
}) {
  const count = projectImages(project).length;
  const ref = useRef<HTMLButtonElement>(null);
  const hasPointer = useHasPointer();
  const reduced = useReducedMotion();
  const tilt = hasPointer && !reduced;
  // Wide featured card tilts less, so it doesn't feel unstable.
  const strength = large ? 3 : 7;

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el || !tilt) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
    el.style.transform = `perspective(1100px) rotateX(${(0.5 - y) * strength}deg) rotateY(${(x - 0.5) * strength * 1.3}deg) translateY(-6px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <button
      ref={ref}
      type="button"
      data-sound="open"
      data-sound-hover
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onOpen}
      data-cursor-label="View"
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface text-left shadow-[var(--card-shadow)]",
        "touch-tilt transition-[transform,border-color,box-shadow] duration-300 ease-out will-change-transform hover:-translate-y-1 hover:border-border-strong hover:shadow-[0_40px_90px_-40px_var(--glow)]",
        large && "lg:flex-row",
      )}
    >
      {/* light glare that follows the cursor */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(520px circle at var(--gx,50%) var(--gy,0%), rgba(255,255,255,0.55), transparent 55%)" }}
      />
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden border-b border-border bg-background-elevated",
          large
            ? "aspect-[16/10] lg:aspect-auto lg:min-h-[440px] lg:w-[62%] lg:border-b-0 lg:border-r"
            : "aspect-[16/10]",
        )}
      >
        <CardMedia project={project} large={large} />

        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              project.status === "LIVE" || project.status === "ON GOOGLE PLAY"
                ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                : "bg-purple-light",
            )}
          />
          {project.status}
        </span>
        {count > 1 && (
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[0.68rem] text-white/80 backdrop-blur-md">
            <Images className="h-3.5 w-3.5" aria-hidden />
            {count}
          </span>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col p-6", large && "lg:p-10")}>
        <span className="t-label">{project.category}</span>
        <h3
          className={cn(
            "mt-3 font-display font-semibold text-foreground",
            large ? "text-[1.6rem] leading-tight lg:text-[2.1rem]" : "text-[1.2rem] leading-snug",
          )}
        >
          {project.title}
        </h3>
        <p
          className={cn(
            "mt-3 text-[0.9rem] leading-relaxed text-muted",
            large ? "lg:text-[0.98rem]" : "line-clamp-3",
          )}
        >
          {project.summary}
        </p>

        {large && (
          <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
            {project.highlights.slice(0, 3).map((h) => (
              <li key={h} className="flex items-start gap-3 text-[0.85rem] text-muted-strong">
                <span className="mt-[0.6rem] h-px w-3 shrink-0 bg-purple-light" />
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          {project.stack && (
            <ul className="flex flex-wrap gap-1.5">
              {project.stack.slice(0, large ? 4 : 3).map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-border px-2.5 py-1 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.1em] text-faint"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-foreground transition-all duration-500 ease-[var(--ease)] group-hover:rotate-45 group-hover:border-purple group-hover:bg-purple">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </button>
  );
}
