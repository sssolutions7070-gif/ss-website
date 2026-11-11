"use client";

import { company } from "@/data/company";
import { useT } from "@/i18n/LanguageProvider";
import { useEffect, useRef } from "react";
import { sound } from "@/lib/sound";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { ContactForm } from "./ContactForm";
import { WhatsNext } from "./WhatsNext";
import { ContactGlobe } from "@/components/three/ContactGlobe";
import { Decor } from "@/components/graphics/Decor";
import { IndiaCities } from "@/components/graphics/IndiaCities";
import { OnlineBadge } from "@/components/ui/OnlineBadge";
import { useCan3D } from "@/hooks/useCan3D";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function Contact() {
  const { t, lang } = useT();
  const can3D = useCan3D();
  const reduced = useReducedMotion();
  const show3D = can3D && !reduced;
  // sound: sonar pings from Pune to the cities when the globe / map scrolls in
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && sound.play("sonar"), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section data-cursor-icon="mail" id="contact" className="section relative isolate border-t border-border">
      <Decor preset="contact" />
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-5">
              <span className="text-purple-light">08</span>
              <span className="text-border-strong">/</span>
              Contact
            </p>
            <AnimatedHeading
              as="h2"
              key={lang}
              text={t("contact.title")}
              className="t-h2 text-foreground"
            />
            <OnlineBadge className="mt-6" />
            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-muted">
              {t("contact.lead")}
            </p>

            <div className="mt-10 space-y-5 border-t border-border pt-8">
              {company.people.map((p) => (
                <div key={p.phoneHref}>
                  <p className="text-[0.8rem] text-faint">{p.role}</p>
                  <p className="font-display text-[0.95rem] font-medium text-foreground">
                    {p.name}
                  </p>
                  <a
                    href={`tel:${p.phoneHref}`}
                    className="text-[0.9rem] text-muted transition-colors hover:text-foreground"
                  >
                    {p.phone}
                  </a>
                </div>
              ))}
              <div className="pt-1">
                <a
                  href={`mailto:${company.email}`}
                  className="text-[0.9rem] text-muted transition-colors hover:text-foreground"
                >
                  {company.email}
                </a>
                <p className="mt-1 text-[0.85rem] text-faint">
                  {company.location}
                </p>
              </div>
            </div>

            <WhatsNext />

            <div ref={mapRef}>
            {/* 3D globe everywhere it can run; the flat city map is the fallback */}
            {show3D ? <ContactGlobe /> : <IndiaCities />}
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
