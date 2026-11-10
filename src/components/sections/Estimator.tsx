"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, LayoutDashboard, Smartphone, Layers, Check, ArrowRight, Clock, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Decor } from "@/components/graphics/Decor";
import { useScrollTo } from "@/hooks/useLenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { ProjectType } from "@/types";

const TYPES = [
  { id: "website", label: "Website", icon: Globe, weeks: 2, form: "Website" as ProjectType },
  { id: "webapp", label: "Web app", icon: LayoutDashboard, weeks: 5, form: "Web Application" as ProjectType },
  { id: "android", label: "Android app", icon: Smartphone, weeks: 5, form: "Mobile App" as ProjectType },
  { id: "both", label: "Website + app", icon: Layers, weeks: 8, form: "Mobile App" as ProjectType },
];
const SIZES = [
  { id: "s", label: "Small", hint: "up to ~8 pages / screens", mult: 1 },
  { id: "m", label: "Medium", hint: "~10–25 pages / screens", mult: 1.5 },
  { id: "l", label: "Large", hint: "25+ pages / screens", mult: 2.2 },
];
const FEATURES = [
  { id: "login", label: "User login & accounts", weeks: 0.8 },
  { id: "pay", label: "Online payments (UPI / cards)", weeks: 1 },
  { id: "admin", label: "Admin panel / dashboard", weeks: 1.5 },
  { id: "notify", label: "Notifications / WhatsApp alerts", weeks: 0.6 },
  { id: "lang", label: "Marathi / Hindi language", weeks: 0.6 },
  { id: "ai", label: "AI features (chatbot, matching)", weeks: 1.5 },
  { id: "integr", label: "Integrations (maps, CRM, APIs)", weeks: 1 },
  { id: "track", label: "Live tracking / location", weeks: 1.5 },
];

function planFor(weeks: number) {
  if (weeks <= 4.5) return { name: "Launch", color: "#16a34a" };
  if (weeks <= 12) return { name: "Grow", color: "#6a46ff" };
  return { name: "Scale", color: "#c026d3" };
}

/**
 * Project estimator: pick type, size and features → recommended plan and a
 * typical timeline. "Get exact quote" pre-fills the contact form.
 * Prices are shared after the free call, so none are shown here.
 */
export function Estimator() {
  const [type, setType] = useState(TYPES[0]);
  const [size, setSize] = useState(SIZES[0]);
  const [features, setFeatures] = useState<string[]>([]);
  const scrollTo = useScrollTo();
  const reduced = useReducedMotion();

  const { low, high, plan } = useMemo(() => {
    const extra = FEATURES.filter((f) => features.includes(f.id)).reduce((n, f) => n + f.weeks, 0);
    const base = type.weeks * size.mult + extra * (type.id === "both" ? 1.4 : 1);
    const lo = Math.max(2, Math.round(base));
    const hi = Math.max(lo + 1, Math.round(base * 1.35));
    return { low: lo, high: hi, plan: planFor(base) };
  }, [type, size, features]);

  const toggle = (id: string) =>
    setFeatures((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const quote = () => {
    const chosen = FEATURES.filter((f) => features.includes(f.id)).map((f) => f.label);
    const message = [
      `I'd like a quote for a ${type.label.toLowerCase()} (${size.label.toLowerCase()} — ${size.hint}).`,
      chosen.length ? `Features: ${chosen.join(", ")}.` : "",
      `The estimator suggested the ${plan.name} plan, about ${low}–${high} weeks.`,
    ]
      .filter(Boolean)
      .join("\n");
    window.dispatchEvent(new CustomEvent("ss:prefill", { detail: { projectType: type.form, message } }));
    scrollTo("#contact", -88);
  };

  const chip = (active: boolean) =>
    cn(
      "relative flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left text-[0.88rem] transition-[border-color,background-color,box-shadow] duration-300",
      active
        ? "border-purple bg-[color-mix(in_oklab,var(--purple)_10%,var(--surface))] text-foreground shadow-[0_10px_30px_-18px_var(--glow)]"
        : "border-border bg-surface text-muted-strong hover:border-border-strong",
    );

  return (
    <section id="estimate" className="section relative isolate">
      <Decor preset="grid" />
      <div className="container-page">
        <SectionHeading
          eyebrow="Cost & timeline estimator"
          title={"Get a rough plan\nin 30 seconds."}
          lead="Pick what you want to build. We'll suggest the right plan and a typical timeline — then send you an exact quote after a free call."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="glass-card relative space-y-8 rounded-[28px] border border-border bg-surface p-6 shadow-[var(--card-shadow)] sm:p-8">
            <fieldset>
              <legend className="t-label mb-3">1 · What do you need?</legend>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {TYPES.map((t) => (
                  <button key={t.id} type="button" aria-pressed={type.id === t.id} onClick={() => setType(t)} className={cn(chip(type.id === t.id), "flex-col items-start")}>
                    <t.icon className={cn("h-5 w-5", type.id === t.id ? "text-purple" : "text-faint")} />
                    <span className="font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="t-label mb-3">2 · How big is it?</legend>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {SIZES.map((s) => (
                  <button key={s.id} type="button" aria-pressed={size.id === s.id} onClick={() => setSize(s)} className={cn(chip(size.id === s.id), "flex-col items-start gap-0.5")}>
                    <span className="font-medium">{s.label}</span>
                    <span className="text-[0.76rem] text-faint">{s.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="t-label mb-3">3 · Features (pick any)</legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {FEATURES.map((f) => {
                  const on = features.includes(f.id);
                  return (
                    <button key={f.id} type="button" aria-pressed={on} onClick={() => toggle(f.id)} className={chip(on)}>
                      <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors", on ? "border-purple bg-purple text-white" : "border-border-strong")}>
                        {on && <Check className="h-3.5 w-3.5" />}
                      </span>
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* result */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="spot-card relative overflow-hidden rounded-[28px] bg-[linear-gradient(150deg,#1a1240,#2a1b6e_55%,#3d2bb8)] p-7 text-white shadow-[0_40px_80px_-35px_rgba(106,70,255,0.8)] sm:p-8">
              <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(192,38,211,0.45),transparent_65%)]" />
              <p className="flex items-center gap-2 text-[0.8rem] uppercase tracking-[0.14em] text-white/60">
                <Sparkles className="h-4 w-4" /> Your estimate
              </p>

              <div className="mt-6">
                <p className="text-[0.85rem] text-white/60">Recommended plan</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={plan.name}
                    initial={reduced ? false : { y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-1 flex items-center gap-3 font-display text-[2.4rem] font-semibold leading-none"
                  >
                    {plan.name}
                    <span className="h-3 w-3 rounded-full" style={{ background: plan.color, boxShadow: `0 0 16px ${plan.color}` }} />
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Clock className="h-5 w-5 text-white/70" />
                <div>
                  <p className="text-[0.8rem] text-white/60">Typical timeline</p>
                  <p className="font-display text-[1.4rem] font-semibold tabular-nums">
                    {low}–{high} weeks
                  </p>
                </div>
              </div>

              {/* complexity meter */}
              <div className="mt-5">
                <div className="flex justify-between text-[0.75rem] text-white/60">
                  <span>Simple</span>
                  <span>Complex</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#6a46ff,#c026d3)]"
                    animate={{ width: `${Math.min(100, (high / 26) * 100)}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>

              <p className="mt-5 text-[0.84rem] leading-relaxed text-white/70">
                Price depends on the exact scope — we share a clear quote after a free 30-minute call.
              </p>

              <button
                type="button"
                onClick={quote}
                data-sound="send"
                className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[0.92rem] font-semibold text-[#2a1b6e] transition-transform hover:-translate-y-0.5"
              >
                Get exact quote
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
