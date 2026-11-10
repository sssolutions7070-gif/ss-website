"use client";

import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Phone, Video, MessageCircle, Mail } from "lucide-react";
import { company } from "@/data/company";
import { waLink } from "@/lib/whatsapp";
import { nextWorkingDays, timeSlots } from "@/lib/hours";
import { OnlineBadge } from "@/components/ui/OnlineBadge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const noop = () => () => {};
let cachedDays: ReturnType<typeof nextWorkingDays> | null = null;
const getDays = () => (cachedDays ??= nextWorkingDays(6));
const NO_DAYS: ReturnType<typeof nextWorkingDays> = [];
const getNoDays = () => NO_DAYS;

const MODES = [
  { id: "phone", label: "Phone call", icon: Phone },
  { id: "meet", label: "Google Meet", icon: Video },
  { id: "wa", label: "WhatsApp video", icon: MessageCircle },
];

/**
 * Lightweight call booking: pick a day, time and call type, then send the
 * request on WhatsApp (or email). No calendar backend needed.
 */
export function BookCall() {
  // dates depend on "now" → computed on the client only (empty during SSR)
  const days = useSyncExternalStore(noop, getDays, getNoDays);
  const slots = timeSlots();
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [mode, setMode] = useState(MODES[0]);
  const [name, setName] = useState("");
  const reduced = useReducedMotion();

  const chosen = days[day];
  const ready = !!chosen && !!slot && name.trim().length > 1;
  const text = chosen
    ? `Hi SS Solutions! I'd like to book a free 30-minute call.\nName: ${name.trim()}\nWhen: ${chosen.day} ${chosen.label}, ${slot ?? "—"} (IST)\nCall type: ${mode.label}`
    : "";

  const pill = (active: boolean) =>
    cn(
      "rounded-2xl border px-3 py-2.5 text-[0.85rem] transition-[border-color,background-color,color] duration-200",
      active ? "border-purple bg-purple text-white" : "border-border bg-surface text-muted-strong hover:border-border-strong",
    );

  return (
    <section id="book" className="section-tight">
      <div className="container-page">
        <div className="tinted tint-lavender !mx-0 relative overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <OnlineBadge />
              <h2 className="t-h2 mt-5 text-foreground">
                Book a free <span className="text-gradient-anim whitespace-nowrap">30‑minute call.</span>
              </h2>
              <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-muted">
                Talk to a founder about your idea — no slides, no sales pitch. Pick a time that suits you and we&apos;ll confirm on WhatsApp.
              </p>
              <ul className="mt-6 space-y-2 text-[0.9rem] text-muted-strong">
                <li>✓ Understand your goals and users</li>
                <li>✓ Suggested approach and tech</li>
                <li>✓ Timeline and next steps</li>
              </ul>
            </div>

            <div className="glass-card relative rounded-[24px] border border-border bg-surface p-5 shadow-[var(--card-shadow)] sm:p-7">
              <p className="t-label flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> Pick a day
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6" suppressHydrationWarning>
                {days.map((d, i) => (
                  <button key={d.iso} type="button" aria-pressed={i === day} onClick={() => setDay(i)} className={cn(pill(i === day), "flex flex-col items-center")}>
                    <span className="text-[0.7rem] uppercase tracking-wide opacity-80">{d.day}</span>
                    <span className="font-semibold">{d.label}</span>
                  </button>
                ))}
              </div>

              <p className="t-label mt-6">Pick a time (IST)</p>
              <div className="mt-3 grid max-h-[148px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                {slots.map((s) => (
                  <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={pill(slot === s)}>
                    {s}
                  </button>
                ))}
              </div>

              <p className="t-label mt-6">How should we call?</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {MODES.map((m) => (
                  <button key={m.id} type="button" aria-pressed={mode.id === m.id} onClick={() => setMode(m)} className={cn(pill(mode.id === m.id), "inline-flex items-center justify-center gap-2")}>
                    <m.icon className="h-4 w-4" /> {m.label}
                  </button>
                ))}
              </div>

              <label className="mt-6 block">
                <span className="t-label">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  suppressHydrationWarning
                  className="mt-2 w-full rounded-xl border border-border-strong bg-background-elevated px-3.5 py-3 text-[0.9rem] text-foreground outline-none placeholder:text-faint focus:border-purple-light/70 focus:ring-2 focus:ring-purple-light/20"
                />
              </label>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <motion.a
                  href={ready ? waLink(company.people[0].phoneHref, text) : "#book"}
                  onClick={(e) => !ready && e.preventDefault()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!ready}
                  whileTap={reduced || !ready ? undefined : { scale: 0.97 }}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[0.9rem] font-semibold text-white transition-opacity",
                    ready ? "bg-[#25D366]" : "pointer-events-none bg-[#25D366]/45",
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  Request on WhatsApp
                </motion.a>
                <a
                  href={ready ? `mailto:${company.email}?subject=${encodeURIComponent("Call booking request")}&body=${encodeURIComponent(text)}` : "#book"}
                  onClick={(e) => !ready && e.preventDefault()}
                  aria-disabled={!ready}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-full border border-border-strong px-5 py-3.5 text-[0.9rem] font-semibold text-foreground",
                    !ready && "pointer-events-none opacity-50",
                  )}
                >
                  <Mail className="h-4 w-4" />
                  Email instead
                </a>
              </div>
              {!ready && <p className="mt-3 text-[0.78rem] text-faint">Choose a time and enter your name to continue.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
