import Link from "next/link";
import { navLinks } from "@/data/navigation";
import { company } from "@/data/company";
import { services } from "@/data/services";
import { Logo } from "./Logo";
import { FooterStatement } from "./FooterStatement";
import { FooterReveal } from "./FooterReveal";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border">
      {/* statement sits on top and lifts away to uncover the footer below */}
      <div className="relative z-10 rounded-b-[clamp(28px,4vw,56px)] bg-background-elevated shadow-[0_40px_60px_-40px_rgba(var(--ink-rgb),0.35)]">
        <FooterStatement />
      </div>
      <FooterReveal className="bg-background">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.1fr] lg:gap-12">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-[0.85rem] leading-relaxed text-muted">
            {company.description}
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="t-label mb-4">Navigate</p>
          <ul className="space-y-2.5 text-[0.88rem]">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={`/${l.href}`}
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/blog" className="text-muted transition-colors hover:text-foreground">
                Insights
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-muted transition-colors hover:text-foreground">
                FAQ
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="t-label mb-4">Services</p>
          <ul className="space-y-2.5 text-[0.88rem]">
            {services.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link
                  href="/#services"
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="t-label mb-4">Contact</p>
          <ul className="space-y-3 text-[0.88rem]">
            {company.people.map((p) => (
              <li key={p.phoneHref}>
                <span className="block text-muted-strong">{p.name}</span>
                <a
                  href={`tel:${p.phoneHref}`}
                  className="inline-block py-1 text-muted transition-colors hover:text-foreground"
                >
                  {p.phone}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${company.email}`}
                className="inline-block break-all py-1 text-muted transition-colors hover:text-foreground"
              >
                {company.email}
              </a>
            </li>
            <li className="text-muted">{company.location}</li>
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col items-start justify-between gap-3 border-t border-border py-6 text-[0.78rem] text-faint sm:flex-row sm:items-center">
        <p>
          © {year} {company.name}. All rights reserved.
        </p>
        {/* Only real profile links are shown — add URLs in src/data/company.ts */}
        {company.socials.some((s) => s.href && s.href !== "#") && (
          <div className="flex gap-5">
            {company.socials
              .filter((s) => s.href && s.href !== "#")
              .map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
          </div>
        )}
      </div>
      </FooterReveal>
    </footer>
  );
}
