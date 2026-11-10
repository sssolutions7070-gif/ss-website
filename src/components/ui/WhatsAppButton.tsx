"use client";

import { useEffect, useState } from "react";
import { siWhatsapp } from "simple-icons";
import { company } from "@/data/company";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const MESSAGE = "Hi SS Solutions! I'd like to discuss a project.";

/**
 * Floating click-to-chat button (opens WhatsApp with a pre-filled message to
 * the first co-founder). Appears after a short scroll; on phones it sits above
 * the sticky "Start a Project" bar.
 */
export function WhatsAppButton() {
  const [show, setShow] = useState(false);
  const person = company.people[0];

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!person) return null;

  return (
    <a
      href={waLink(person.phoneHref, MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${company.name} on WhatsApp`}
      className={cn(
        "group fixed right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_14px_34px_-10px_rgba(37,211,102,0.65)] transition-[transform,opacity] duration-500 ease-[var(--ease)] hover:scale-105 sm:right-6",
        "bottom-[5.5rem] sm:bottom-6",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <span aria-hidden className="absolute inset-1 -z-10 animate-ping rounded-full bg-[#25D366] opacity-25 [animation-duration:2.4s]" />
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" aria-hidden>
        <path d={siWhatsapp.path} />
      </svg>
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-[0.85rem] font-semibold transition-[max-width,margin] duration-500 ease-[var(--ease)] group-hover:mr-1 group-hover:max-w-[12rem] md:inline">
        Chat on WhatsApp
      </span>
    </a>
  );
}
