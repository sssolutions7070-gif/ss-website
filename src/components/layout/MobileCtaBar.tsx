"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { primaryCta } from "@/data/navigation";
import { useScrollTo } from "@/hooks/useLenis";
import { useT } from "@/i18n/LanguageProvider";

/**
 * Persistent conversion anchor on phones. Appears once the hero is scrolled
 * past and hides again over the contact section (where the real form lives).
 * sm and up never see it — the navbar CTA is always visible there.
 */
export function MobileCtaBar() {
  const [show, setShow] = useState(false);
  const scrollTo = useScrollTo();
  const { t } = useT();

  useEffect(() => {
    const contact = document.getElementById("contact");
    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.85;
      const atContact = contact
        ? contact.getBoundingClientRect().top < window.innerHeight * 0.9
        : false;
      setShow(pastHero && !atContact);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/85 backdrop-blur-xl transition-[transform,opacity] duration-500 ease-[var(--ease)] sm:hidden ${
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <span className="text-[0.82rem] text-muted">
          {t("mobile.prompt")}
        </span>
        <button
          type="button"
          onClick={() => scrollTo(primaryCta.href, -80)}
          className="inline-flex items-center gap-1.5 rounded-full bg-purple px-4 py-2.5 text-[0.82rem] font-medium text-white"
        >
          {t("cta.start")}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
