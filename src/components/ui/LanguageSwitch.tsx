"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Check } from "lucide-react";
import { LANGS } from "@/i18n/dict";
import { useT } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

/** Compact EN / हि / मरा picker for the navbar. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${current.short} — change language`}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-3 text-[0.8rem] font-medium text-foreground transition-colors hover:border-border-strong"
      >
        <Languages className="h-4 w-4 text-muted" />
        {current.short}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Choose language"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-2xl border border-border-strong bg-background-elevated p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]"
          >
            {LANGS.map((l) => (
              <li key={l.id} role="option" aria-selected={l.id === lang}>
                <button
                  type="button"
                  data-sound="none"
                  onClick={() => {
                    setLang(l.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[0.9rem] transition-colors",
                    l.id === lang ? "bg-[rgba(var(--ink-rgb),0.06)] text-foreground" : "text-muted-strong hover:bg-[rgba(var(--ink-rgb),0.04)]",
                  )}
                >
                  {l.name}
                  {l.id === lang && <Check className="h-4 w-4 text-purple" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
