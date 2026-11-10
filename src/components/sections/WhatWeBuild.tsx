"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { projects } from "@/data/projects";
import type { Project, ProjectFilter } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ProjectDialog } from "@/components/ui/ProjectDialog";
import { TextLink } from "@/components/ui/TextLink";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { Decor } from "@/components/graphics/Decor";

type Tab = "all" | ProjectFilter;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All work" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile apps" },
  { id: "ai", label: "AI & ML" },
  { id: "games", label: "Games" },
];

export function WhatWeBuild() {
  const [tab, setTab] = useState<Tab>("all");
  const [open, setOpen] = useState<Project | null>(null);
  const reduced = useReducedMotion();
  const close = useCallback(() => setOpen(null), []);
  const gridRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: projects.length, web: 0, mobile: 0, ai: 0, games: 0 };
    for (const p of projects) for (const f of p.filters) c[f] += 1;
    return c;
  }, []);

  const visible = useMemo(
    () => (tab === "all" ? projects : projects.filter((p) => p.filters.includes(tab))),
    [tab],
  );

  // The featured project leads "All work"; in filtered views everything is a regular tile.
  const featured = tab === "all" ? visible.find((p) => p.featured) : undefined;
  const rest = featured ? visible.filter((p) => p !== featured) : visible;

  const tile = (p: Project, large = false) => (
    <motion.div
      key={p.id}
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, rotateY: -80, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, rotateY: 80, scale: 0.92 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1200 }}
      className={cn(large && "md:col-span-2 lg:col-span-3")}
    >
      <ProjectCard project={p} large={large} onOpen={() => setOpen(p)} />
    </motion.div>
  );

  return (
    <section id="work" className="section relative isolate">
      <Decor preset="work" />
      <div className="container-page">
        <SectionHeading
          index="02"
          eyebrow="Projects"
          title={"Products we've\ndesigned, built\nand shipped"}
          lead="Websites, mobile apps, AI systems and games — live on the web, on Google Play, and in production with our clients. Open any project to see the screens."
          action={<TextLink href="#contact">Start yours</TextLink>}
        />

        <LayoutGroup>
          {/* filter bar sticks under the navbar while you browse the grid */}
          <div className="sticky top-[80px] z-20 -mx-2 mt-10 flex items-center gap-3 rounded-full px-2 py-2 sm:top-[84px]">
          <div
            role="tablist"
            aria-label="Filter projects"
            className="flex gap-2 overflow-x-auto rounded-full border border-border bg-background/90 p-1.5 shadow-[0_12px_30px_-18px_rgba(var(--ink-rgb),0.4)] backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setTab(t.id);
                    // if the grid's top is above the screen, bring it back into view
                    const g = gridRef.current;
                    if (g && g.getBoundingClientRect().top < 0) {
                      window.scrollTo({ top: g.getBoundingClientRect().top + window.scrollY - 150, behavior: "smooth" });
                    }
                  }}
                  className={cn(
                    "relative inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[0.85rem] transition-colors duration-300",
                    active
                      ? "border-transparent text-background"
                      : "border-border text-muted hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="project-tab"
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative font-medium">{t.label}</span>
                  <span
                    className={cn(
                      "relative font-[family-name:var(--font-mono)] text-[0.68rem]",
                      active ? "text-background/60" : "text-faint",
                    )}
                  >
                    {String(counts[t.id]).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/90 px-3.5 py-2 text-[0.8rem] text-muted backdrop-blur-md sm:inline-flex">
            Showing
            <span className="relative inline-flex h-[1.2em] w-[1.4em] justify-center overflow-hidden font-semibold text-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={visible.length}
                  initial={reduced ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute tabular-nums"
                >
                  {visible.length}
                </motion.span>
              </AnimatePresence>
            </span>
            projects
          </span>
          </div>

          <motion.div
            ref={gridRef}
            layout={!reduced}
            className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {featured && tile(featured, true)}
              {rest.map((p) => tile(p))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>

      <ProjectDialog project={open} onClose={close} />
    </section>
  );
}
