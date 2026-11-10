"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { sound, type SoundName } from "@/lib/sound";
import { cn } from "@/lib/utils";

const get = () => sound.enabled;
const getServer = () => false;
const NUDGE_KEY = "ss-sound-nudge";

/** Navbar button that turns the UI sounds on/off (off by default). */
export function SoundToggle({ className, nudge = false }: { className?: string; nudge?: boolean }) {
  const on = useSyncExternalStore(sound.subscribe, get, getServer);
  const [hint, setHint] = useState(false);

  // one gentle "try sound" hint per visitor (desktop navbar only)
  useEffect(() => {
    if (!nudge || on) return;
    let seen = "1";
    try {
      seen = localStorage.getItem(NUDGE_KEY) ?? "";
    } catch {
      /* ignore */
    }
    if (seen || !window.matchMedia("(hover: hover)").matches) return;
    const show = window.setTimeout(() => setHint(true), 7000);
    const hide = window.setTimeout(() => setHint(false), 14000);
    try {
      localStorage.setItem(NUDGE_KEY, "1");
    } catch {
      /* ignore */
    }
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [nudge, on]);

  return (
    <span className={cn("relative", className)}>
      <button
        type="button"
        data-sound="none"
        onClick={() => {
          setHint(false);
          sound.set(!on);
        }}
        aria-pressed={on}
        aria-label={on ? "Turn sound effects off" : "Turn sound effects on"}
        title={on ? "Sound on" : "Sound off"}
        className={cn(
          "relative grid h-10 w-10 place-items-center rounded-full border transition-colors",
          on ? "border-purple/50 bg-[color-mix(in_oklab,var(--purple)_12%,transparent)] text-purple" : "border-border text-foreground hover:border-border-strong",
        )}
      >
        {on ? <Volume2 className="h-[17px] w-[17px]" /> : <VolumeX className="h-[17px] w-[17px] text-muted" />}
        {/* little equaliser bars while sound is on */}
        {on && (
          <span aria-hidden className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-end gap-[2px]">
            {[0, 1, 2].map((i) => (
              <span key={i} className="sound-bar w-[2px] rounded-full bg-purple" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        )}
      </button>
      <AnimatePresence>
        {hint && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="pointer-events-none absolute right-0 top-12 whitespace-nowrap rounded-xl border border-border-strong bg-background-elevated px-3 py-2 text-[0.78rem] text-foreground shadow-lg"
          >
            🔊 Turn on sound for the full experience
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * One set of delegated listeners maps interactions to sounds (only when sound
 * is on):
 *  - hover: links/buttons → tick, cards → soft shimmer, flip cards → swish
 *  - press: tabs, toggles (aria-pressed), accordions (aria-expanded), WhatsApp
 *    links, slider arrows, or any element with data-sound="<name>"
 *  - typing in fields → soft key clicks
 *  - theme / language changes → their own chimes
 */
export function SoundEffects() {
  // re-scan sections after client-side navigation
  const pathname = usePathname();
  useEffect(() => {
    let lastHover: Element | null = null;
    let lastCard: Element | null = null;
    const ACTION = 'a, button, [role="button"], [role="tab"], [role="option"], summary, label';

    const over = (e: PointerEvent) => {
      if (!sound.enabled || e.pointerType !== "mouse") return;
      const t = e.target as Element | null;
      const flip = t?.closest?.(".flip-card");
      const card = t?.closest?.(".glass-card, .spot-card, [data-sound-hover]");
      if (flip && flip !== lastCard) {
        lastCard = flip;
        sound.play("flip");
        return;
      }
      if (card && card !== lastCard) {
        lastCard = card;
        sound.play("hoverCard");
      }
      if (!card && !flip) lastCard = null;
      const el = t?.closest?.(ACTION) ?? null;
      if (el && el !== lastHover && (el as HTMLElement).dataset.sound !== "none") {
        lastHover = el;
        sound.play("hover");
      } else if (!el) lastHover = null;
    };

    const down = (e: PointerEvent) => {
      if (!sound.enabled) return;
      const t = e.target as Element | null;
      const explicit = t?.closest?.<HTMLElement>("[data-sound]");
      if (explicit) {
        const name = explicit.dataset.sound as SoundName | "none";
        if (name !== "none") sound.play(name);
        return;
      }
      const el = t?.closest?.<HTMLElement>(ACTION);
      if (!el) return;
      if (el.getAttribute("role") === "tab") return sound.play("tab");
      if (el.hasAttribute("aria-pressed")) return sound.play(el.getAttribute("aria-pressed") === "true" ? "deselect" : "select");
      if (el.hasAttribute("aria-expanded")) return sound.play(el.getAttribute("aria-expanded") === "true" ? "close" : "open");
      const href = el.getAttribute("href") ?? "";
      if (/wa\.me|whatsapp|mailto:|tel:/.test(href)) return sound.play("send");
      if (/^Previous|^Next|^Close/.test(el.getAttribute("aria-label") ?? "")) {
        return sound.play(el.getAttribute("aria-label")!.startsWith("Close") ? "close" : "swipe");
      }
      sound.play("click");
    };

    const key = (e: KeyboardEvent) => {
      if (!sound.enabled || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (!t || !/^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (e.key.length === 1 || e.key === "Backspace") sound.play("type");
    };

    // theme + language changes, wherever they come from
    const root = document.documentElement;
    let theme = root.dataset.theme;
    let lang = root.lang;
    const mo = new MutationObserver(() => {
      if (root.dataset.theme !== theme) {
        theme = root.dataset.theme;
        sound.play(theme === "dark" ? "themeDark" : "themeLight");
      }
      if (root.lang !== lang) {
        lang = root.lang;
        sound.play("language");
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme", "lang"] });

    // ---- end of page: closing chord (section-specific scroll sounds live in each section) ----
    let atEnd = false;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!sound.enabled) return;
        const bottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 6;
        if (bottom && !atEnd) sound.play("end");
        atEnd = bottom;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("keydown", key, { passive: true });
    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [pathname]);
  return null;
}
