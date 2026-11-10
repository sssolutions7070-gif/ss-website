"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Hash,
  FolderOpen,
  FileText,
  Moon,
  MessageCircle,
  Mail,
  Phone,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { navLinks } from "@/data/navigation";
import { projects } from "@/data/projects";
import { posts } from "@/data/blog";
import { company } from "@/data/company";
import { waLink } from "@/lib/whatsapp";
import { useTheme } from "@/hooks/useTheme";
import { useScrollTo } from "@/hooks/useLenis";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

interface Item {
  id: string;
  group: "Go to" | "Projects" | "Insights" | "Actions";
  label: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
}

const OPEN_EVENT = "ss:command-open";
/** Open the menu from anywhere (e.g. the navbar search button). */
export const openCommandMenu = () => window.dispatchEvent(new Event(OPEN_EVENT));

/** Ctrl/⌘ + K quick menu: jump to sections, projects, articles or actions. */
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const { toggle } = useTheme();
  const scrollTo = useScrollTo();

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setActive(0);
  }, []);

  const items = useMemo<Item[]>(() => {
    const extra = [
      { label: "Industries", href: "#industries" },
      { label: "Pricing", href: "#pricing" },
      { label: "Cost estimator", href: "#estimate" },
      { label: "FAQ", href: "#faq" },
      { label: "Book a free call", href: "#book" },
    ];
    return [
      ...[...navLinks, ...extra].map((l) => ({
        id: `go-${l.href}`,
        group: "Go to" as const,
        label: l.label,
        icon: Hash,
        run: () => scrollTo(l.href, -88),
      })),
      ...projects.map((p) => ({
        id: `p-${p.id}`,
        group: "Projects" as const,
        label: p.title,
        hint: p.category.toLowerCase(),
        icon: FolderOpen,
        run: () => router.push(`/work/${p.id}`),
      })),
      ...posts.map((p) => ({
        id: `b-${p.slug}`,
        group: "Insights" as const,
        label: p.title,
        hint: p.tag,
        icon: FileText,
        run: () => router.push(`/blog/${p.slug}`),
      })),
      { id: "a-theme", group: "Actions", label: "Switch light / dark mode", icon: Moon, run: toggle },
      {
        id: "a-wa",
        group: "Actions",
        label: "Chat on WhatsApp",
        icon: MessageCircle,
        run: () => window.open(waLink(company.people[0].phoneHref, "Hi SS Solutions! I'd like to discuss a project."), "_blank", "noopener"),
      },
      { id: "a-mail", group: "Actions", label: `Email ${company.email}`, icon: Mail, run: () => window.location.assign(`mailto:${company.email}`) },
      ...company.people.map((p) => ({
        id: `a-call-${p.phoneHref}`,
        group: "Actions" as const,
        label: `Call ${p.name.split(" ")[0]} — ${p.phone}`,
        icon: Phone,
        run: () => window.location.assign(`tel:${p.phoneHref}`),
      })),
    ];
  }, [router, scrollTo, toggle]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    const words = s.split(/\s+/);
    return items.filter((it) => {
      const hay = `${it.label} ${it.hint ?? ""} ${it.group}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [items, q]);

  // keyboard shortcut + external open event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // open / close sounds (also when toggled from the keyboard)
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open !== wasOpen.current) sound.play(open ? "open" : "close");
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => input.current?.focus(), 30);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (it: Item | undefined) => {
    if (!it) return;
    close();
    window.setTimeout(it.run, 60);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(filtered[active]);
    } else if (e.key === "Escape") {
      close();
    }
  };

  let idx = -1;
  const groups = ["Go to", "Projects", "Insights", "Actions"] as const;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[160] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={close} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Quick search"
            initial={{ y: 16, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-[22px] border border-border-strong bg-background-elevated shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-5 w-5 text-faint" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Search sections, projects, articles…"
                className="h-14 flex-1 bg-transparent text-[1rem] text-foreground outline-none placeholder:text-faint focus-visible:outline-none"
                aria-activedescendant={filtered[active] ? `cmd-${filtered[active].id}` : undefined}
              />
              <kbd className="rounded-md border border-border px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[0.68rem] text-faint">Esc</kbd>
            </div>
            <ul ref={list} role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 && <li className="px-3 py-8 text-center text-[0.9rem] text-muted">No results for “{q}”</li>}
              {groups.map((g) => {
                const rows = filtered.filter((f) => f.group === g);
                if (!rows.length) return null;
                return (
                  <li key={g} role="presentation">
                    <p className="px-3 pb-1.5 pt-3 text-[0.7rem] uppercase tracking-[0.14em] text-faint">{g}</p>
                    <ul role="presentation">
                      {rows.map((it) => {
                        idx += 1;
                        const i = idx;
                        const on = i === active;
                        return (
                          <li
                            key={it.id}
                            id={`cmd-${it.id}`}
                            role="option"
                            aria-selected={on}
                            data-idx={i}
                            onMouseMove={() => setActive(i)}
                            onClick={() => choose(it)}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.92rem]",
                              on ? "bg-purple text-white" : "text-muted-strong",
                            )}
                          >
                            <it.icon className={cn("h-4 w-4 shrink-0", on ? "text-white" : "text-faint")} />
                            <span className="flex-1 truncate">{it.label}</span>
                            {it.hint && <span className={cn("hidden text-[0.75rem] sm:inline", on ? "text-white/70" : "text-faint")}>{it.hint}</span>}
                            {on && <CornerDownLeft className="h-3.5 w-3.5 text-white/80" />}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[0.72rem] text-faint">
              <span>↑↓ to move</span>
              <span>↵ to open</span>
              <span className="ml-auto">Ctrl / ⌘ + K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
