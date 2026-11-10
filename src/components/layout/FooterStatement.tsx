"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { siWhatsapp } from "simple-icons";
import { company } from "@/data/company";
import { waLink } from "@/lib/whatsapp";
import { useScrollTo } from "@/hooks/useLenis";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { useT } from "@/i18n/LanguageProvider";

/** Full-width closing statement at the top of the footer. */
export function FooterStatement() {
  const scrollTo = useScrollTo();
  const { t, lang } = useT();
  return (
    <div className="container-page pb-14 pt-20 md:pb-20 md:pt-28">
      <button
        type="button"
        onClick={() => scrollTo("#contact", -88)}
        data-cursor-label="Let's go"
        className="group block w-full text-left"
      >
        <AnimatedHeading
          as="p"
          key={lang}
          text={t("footer.title")}
          highlightFrom={1}
          split="chars"
          className="font-display text-[clamp(3.2rem,1.5rem+9vw,11rem)] font-bold leading-[0.92] tracking-[-0.05em] text-foreground"
        />
        <span className="mt-6 block h-[3px] w-full origin-left scale-x-[0.15] rounded-full bg-[linear-gradient(90deg,var(--purple),var(--blue),#c026d3)] transition-transform duration-[1.1s] ease-[var(--ease)] group-hover:scale-x-100" />
      </button>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => scrollTo("#contact", -88)}
          className="group inline-flex items-center gap-2 rounded-full bg-purple px-6 py-3.5 text-[0.95rem] font-semibold text-white shadow-[0_14px_34px_-12px_var(--glow)] transition-transform hover:-translate-y-0.5"
        >
          Start a project
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
        <a
          href={waLink(company.people[0].phoneHref, "Hi SS Solutions! I'd like to discuss a project.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3.5 text-[0.95rem] font-semibold text-foreground transition-colors hover:bg-[rgba(var(--ink-rgb),0.05)]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]" aria-hidden>
            <path d={siWhatsapp.path} />
          </svg>
          WhatsApp
        </a>
        <a
          href={`mailto:${company.email}`}
          className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3.5 text-[0.95rem] font-semibold text-foreground transition-colors hover:bg-[rgba(var(--ink-rgb),0.05)]"
        >
          <Mail className="h-4 w-4" />
          Email us
        </a>
      </div>
    </div>
  );
}
