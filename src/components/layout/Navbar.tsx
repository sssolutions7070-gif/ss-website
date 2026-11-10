"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Menu, Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navLinks, primaryCta } from "@/data/navigation";
import { useScrollTo } from "@/hooks/useLenis";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { useT } from "@/i18n/LanguageProvider";
import { LanguageSwitch } from "@/components/ui/LanguageSwitch";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { openCommandMenu } from "@/components/ui/CommandMenu";
import { SplitHover } from "@/components/fx/SplitHover";

const SECTION_IDS = navLinks.map((l) => l.href.replace("#", ""));

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = useScrollTo();
  const { t } = useT();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollTo(href, -88);
  };

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-40"
      >
        {/* full-width bar at the top; shrinks into a floating pill once you scroll */}
        <div
          className={cn(
            "pointer-events-auto mx-auto flex items-center justify-between border transition-[max-width,height,margin,padding,border-radius,background-color,border-color,box-shadow] duration-500 ease-[var(--ease)]",
            scrolled
              ? "mt-3 h-[60px] max-w-[min(1120px,calc(100%-24px))] rounded-full border-border bg-background/[0.94] px-3 pl-5 shadow-[0_14px_40px_-18px_rgba(var(--ink-rgb),0.35)] backdrop-blur-2xl backdrop-saturate-150 sm:pl-6"
              : "mt-0 h-[68px] max-w-[var(--container)] rounded-none border-transparent bg-transparent shadow-none px-[var(--gutter)]",
          )}
          // inline so it beats the global `* { border-color }` base rule
          style={scrolled ? undefined : { borderColor: "transparent" }}
        >
          <a
            href="#home"
            onClick={(e) => go(e, "#home")}
            aria-label="SS Solutions — home"
            className="relative z-10"
          >
            <Logo />
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {navLinks.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = active === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => go(e, link.href)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative py-3 text-[0.82rem] tracking-tight transition-colors duration-200 2xl:text-[0.9rem]",
                    isActive
                      ? "text-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <SplitHover text={t(`nav.${link.label}` as Parameters<typeof t>[0])} />
                  {isActive && (
                    // shared layoutId → the underline glides between links
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full bg-[linear-gradient(90deg,var(--purple),var(--blue))]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCommandMenu}
              aria-label="Search the site (Ctrl+K)"
              title="Search (Ctrl+K)"
              className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-border-strong"
            >
              <Search className="h-[17px] w-[17px]" />
            </button>
            <LanguageSwitch className="hidden sm:block" />
            <SoundToggle className="hidden sm:block" nudge />
            <ThemeToggle />
            <div className="hidden sm:block">
              <MagneticButton
                href={primaryCta.href}
                className="px-5 py-2.5 text-[0.82rem]"
              >
                {t("cta.start")}
              </MagneticButton>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-border-strong lg:hidden"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
