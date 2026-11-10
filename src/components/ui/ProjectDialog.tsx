"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TransitionLink } from "@/components/providers/PageTransition";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Project } from "@/types";
import { LenisContext, useScrollTo } from "@/hooks/useLenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { projectImages } from "./ProjectCard";

/**
 * Full-screen project viewer: large gallery (arrows, keyboard, swipe, thumbnails)
 * beside the full write-up. Locks page scroll while open.
 */
export function ProjectDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {project && <DialogBody key={project.id} project={project} onClose={onClose} />}
    </AnimatePresence>
  );
}

function DialogBody({ project, onClose }: { project: Project; onClose: () => void }) {
  const images = projectImages(project);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const lenisRef = useContext(LenisContext);
  const closeRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollTo = useScrollTo();
  const current = images[index];

  const go = useCallback(
    (step: number) => {
      setDir(step);
      setIndex((i) => (i + step + images.length) % images.length);
    },
    [images.length],
  );

  // Scroll lock + focus + keyboard
  useEffect(() => {
    const lenis = lenisRef?.current;
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const opener = document.activeElement as HTMLElement | null;
    // Move focus into the dialog without flashing a focus ring for mouse users.
    const quiet = { preventScroll: true, focusVisible: false } as FocusOptions;
    closeRef.current?.focus(quiet);
    if (document.activeElement !== closeRef.current) mobileCloseRef.current?.focus(quiet);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
      opener?.focus?.();
    };
  }, [lenisRef, onClose, go]);

  // Keep the active thumbnail in view
  useEffect(() => {
    const el = thumbsRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  const startProject = () => {
    onClose();
    window.setTimeout(() => scrollTo("#contact", -88), 60);
  };

  const accent = project.accent ?? "#7c5cff";

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-stretch justify-center sm:items-center sm:p-5 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-dialog-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} aria-hidden />

      {/* Mobile close: outside the scrolling panel so it is always reachable */}
      <button
        ref={mobileCloseRef}
        type="button"
        onClick={onClose}
        aria-label="Close project"
        className="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md lg:hidden"
      >
        <X className="h-5 w-5" />
      </button>

      <motion.div
        data-lenis-prevent
        className="relative flex h-[100dvh] w-full max-w-[1320px] flex-col overflow-y-auto bg-background sm:h-[min(92dvh,920px)] sm:rounded-[var(--radius-lg)] sm:border sm:border-border-strong lg:flex-row lg:overflow-hidden"
        initial={reduced ? false : { opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Viewer */}
        <div className="relative flex shrink-0 flex-col bg-background-elevated lg:w-[64%] lg:shrink">
          <div
            id="pt-dialog-media" className="relative h-[52dvh] w-full overflow-hidden sm:h-[56dvh] lg:h-auto lg:flex-1"
            style={{ background: `radial-gradient(90% 70% at 50% 0%, ${accent}22, transparent 70%)` }}
          >
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={current.src}
                custom={dir}
                className="absolute inset-0"
                initial={reduced ? false : { opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                drag={images.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.35}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) go(1);
                  else if (info.offset.x > 70) go(-1);
                }}
              >
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 850px"
                  className={cn(
                    "pointer-events-none select-none object-contain",
                    current.portrait ? "p-4 sm:p-6" : "p-3 sm:p-5",
                  )}
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/80"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/80"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="pointer-events-none absolute bottom-3 left-1/2 max-w-[90%] -translate-x-1/2 truncate whitespace-nowrap rounded-full bg-black/60 px-3 py-1 text-[0.72rem] text-white/85 backdrop-blur-md">
              <span className="hidden sm:inline">{current.alt} · </span>
              {index + 1} / {images.length}
            </div>
          </div>

          {images.length > 1 && (
            <div
              ref={thumbsRef}
              className="flex shrink-0 gap-2 overflow-x-auto border-t border-border px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => {
                    setDir(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={`Show image ${i + 1}: ${img.alt}`}
                  aria-current={i === index}
                  className={cn(
                    "relative h-14 shrink-0 overflow-hidden rounded-lg border-2 bg-black transition-[opacity,border-color]",
                    img.portrait ? "w-9" : "w-20",
                    i === index ? "border-purple" : "border-transparent opacity-55 hover:opacity-100",
                  )}
                >
                  <Image src={img.src} alt="" fill sizes="80px" className="object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div
          data-lenis-prevent
          className="flex flex-col border-border p-6 sm:p-8 lg:w-[36%] lg:overflow-y-auto lg:border-l lg:p-10"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-strong px-3 py-1 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
              {project.status}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close project"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:bg-white/10 max-lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <span className="t-label mt-7">{project.category}</span>
          <h2
            id="project-dialog-title"
            className="mt-3 font-display text-[1.75rem] font-semibold leading-tight text-foreground lg:text-[2rem]"
          >
            {project.title}
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-strong">{project.summary}</p>

          <h3 className="t-label mt-8">What we built</h3>
          <ul className="mt-4 space-y-3">
            {project.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-[0.9rem] leading-relaxed text-muted-strong">
                <span
                  className="mt-[0.45rem] inline-flex h-2 w-2 shrink-0 rounded-full"
                  style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
                />
                {h}
              </li>
            ))}
          </ul>

          {project.stack && project.stack.length > 0 && (
            <>
              <h3 className="t-label mt-8">Technology</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-border-strong bg-surface px-3 py-1.5 text-[0.78rem] text-muted-strong"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </>
          )}

          <TransitionLink
            href={`/work/${project.id}`}
            label={project.title}
            accent={project.accent}
            image={current.src}
            fromSelector="#pt-dialog-media"
            onNavigate={onClose}
            className="group mt-8 inline-flex items-center gap-2 self-start rounded-full border border-border-strong px-4 py-2 text-[0.86rem] font-medium text-foreground transition-colors hover:bg-[rgba(var(--ink-rgb),0.05)]"
          >
            Read the full case study
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </TransitionLink>

          <div className="mt-auto pt-10">
            <div className="rounded-[var(--radius)] border border-border bg-surface p-5">
              <p className="text-[0.9rem] text-muted-strong">Want something like this for your business?</p>
              <button
                type="button"
                onClick={startProject}
                className="group mt-4 inline-flex items-center gap-2 rounded-full bg-purple px-5 py-2.5 text-[0.88rem] font-medium text-white transition-colors hover:bg-[color-mix(in_oklab,var(--purple)_88%,white)]"
              >
                Start a similar project
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
