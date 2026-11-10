"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { navLinks, primaryCta } from "@/data/navigation";
import { company } from "@/data/company";
import { useScrollTo } from "@/hooks/useLenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useT } from "@/i18n/LanguageProvider";
import { LanguageSwitch } from "@/components/ui/LanguageSwitch";
import { SoundToggle } from "@/components/ui/SoundToggle";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/** Fullscreen mobile navigation. */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { t } = useT();
  const scrollTo = useScrollTo();
  const reduced = useReducedMotion();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const go = (href: string) => {
    onClose();
    setTimeout(() => scrollTo(href, -80), 260);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden"
          initial={{ opacity: 0, clipPath: "circle(0% at 92% 4%)" }}
          animate={{
            opacity: 1,
            clipPath: "circle(150% at 92% 4%)",
            transition: { duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] },
          }}
          exit={{
            opacity: 0,
            clipPath: "circle(0% at 92% 4%)",
            transition: { duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] },
          }}
        >
          <div className="flex items-center justify-between px-6 py-5">
            <span className="flex items-center gap-3">
              <span className="eyebrow">Menu</span>
              <LanguageSwitch />
              <SoundToggle />
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-1 px-6">
            {navLinks.map((link, i) => (
              <motion.button
                key={link.href}
                type="button"
                onClick={() => go(link.href)}
                className="flex items-baseline justify-between border-b border-border py-5 text-left"
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: reduced ? 0 : 0.14 + i * 0.05 },
                }}
              >
                <span className="font-display text-[1.9rem] font-semibold text-foreground">
                  {t(`nav.${link.label}` as Parameters<typeof t>[0])}
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[0.7rem] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.button>
            ))}
          </nav>

          <div className="space-y-4 px-6 pb-10 pt-6">
            <button
              type="button"
              onClick={() => go(primaryCta.href)}
              className="w-full rounded-full bg-purple px-6 py-4 text-center text-[0.95rem] font-medium text-white"
            >
              {t("cta.start")}
            </button>
            <div className="flex flex-col gap-1 text-[0.85rem] text-muted">
              {company.people.map((p) => (
                <a
                  key={p.phoneHref}
                  href={`tel:${p.phoneHref}`}
                  className="link-underline w-fit"
                >
                  {p.name} — {p.phone}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
