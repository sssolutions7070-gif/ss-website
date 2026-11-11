"use client";

import Image from "next/image";
import { useState } from "react";
import { Phone, RotateCw } from "lucide-react";
import { siWhatsapp } from "simple-icons";
import { company } from "@/data/company";
import { waLink } from "@/lib/whatsapp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Decor } from "@/components/graphics/Decor";

const GRADIENTS = ["linear-gradient(140deg,#6a46ff,#3d63ff)", "linear-gradient(140deg,#c026d3,#6a46ff)"];

/**
 * Founders. Cards flip on hover/focus to reveal direct contact.
 * Uses initials until photos are added (put them in /public/team and set `photo`).
 */
export function Team() {
  // tap to flip (phones have no hover)
  const [flipped, setFlipped] = useState<number | null>(null);
  return (
    <section id="team" className="section relative isolate pt-0">
      <Decor preset="team" />
      <div className="container-page">
        <SectionHeading
          eyebrow="The people you'll work with"
          title={"Founders who\nbuild, not just sell."}
          lead="You talk directly to the people designing and writing your product — no account managers in between."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:max-w-4xl">
          {company.people.map((p, i) => {
            const initials = p.name
              .split(" ")
              .map((n) => n[0])
              .join("");
            return (
              <ScrollReveal key={p.phoneHref} delay={i * 0.08}>
                <div
                  className={`flip-card h-[340px] ${flipped === i ? "is-flipped" : ""}`}
                  tabIndex={0}
                  aria-label={`${p.name}, ${p.role}`}
                  onClick={(e) => {
                    if ((e.target as Element).closest("a")) return; // let the WhatsApp / call links work
                    setFlipped(flipped === i ? null : i);
                  }}
                >
                  <div className="flip-inner">
                    {/* front */}
                    <div className="flip-face glass-card flex flex-col overflow-hidden rounded-[28px] border border-border bg-surface shadow-[var(--card-shadow)]">
                      <div className="relative grid h-[200px] place-items-center" style={{ background: GRADIENTS[i % 2] }}>
                        {p.photo ? (
                          <Image src={p.photo} alt={p.name} fill sizes="(max-width: 640px) 100vw, 440px" className="object-cover object-top" />
                        ) : (
                          <span className="font-display text-[5.5rem] font-bold leading-none text-white/95 [text-shadow:0_10px_30px_rgba(0,0,0,0.25)]">
                            {initials}
                          </span>
                        )}
                        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[0.68rem] font-medium text-white backdrop-blur">
                          <RotateCw className="h-3 w-3" />
                          <span className="hidden [@media(hover:hover)]:inline">Hover to connect</span>
                          <span className="[@media(hover:hover)]:hidden">Tap to connect</span>
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col justify-center p-6">
                        <div className="font-display text-[1.35rem] font-semibold text-foreground">{p.name}</div>
                        <div className="mt-1 text-[0.9rem] text-muted">
                          {p.role}, {company.name}
                        </div>
                      </div>
                    </div>
                    {/* back */}
                    <div
                      className="flip-face flip-back flex flex-col justify-center gap-4 rounded-[28px] p-8 text-white"
                      style={{ background: GRADIENTS[i % 2] }}
                    >
                      <div className="font-display text-[1.5rem] font-semibold">Talk to {p.name.split(" ")[0]}</div>
                      <p className="text-[0.92rem] text-white/80">
                        Share your idea directly — we usually reply the same day.
                      </p>
                      <a
                        href={waLink(p.phoneHref, `Hi ${p.name.split(" ")[0]}! I'd like to discuss a project with SS Solutions.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[0.9rem] font-semibold text-[#128c4a] transition-transform hover:scale-[1.02]"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]" aria-hidden>
                          <path d={siWhatsapp.path} />
                        </svg>
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${p.phoneHref}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-5 py-3 text-[0.9rem] font-semibold text-white transition-colors hover:bg-white/10"
                      >
                        <Phone className="h-4 w-4" />
                        {p.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
