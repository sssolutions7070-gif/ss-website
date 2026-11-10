"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { Loader2, ArrowRight, MessageCircle } from "lucide-react";
import type { ContactFormValues, ProjectType } from "@/types";
import { company } from "@/data/company";
import { whatsappSummary, waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/LanguageProvider";
import { sound } from "@/lib/sound";
import { burstConfetti } from "@/components/fx/GlobalFx";

const PROJECT_TYPES: ProjectType[] = [
  "Website",
  "Web Application",
  "Mobile App",
  "Custom Software",
  "Digital Marketing",
  "Automation",
  "Consultancy",
  "Other",
];

const BUDGETS = [
  "Under ₹1 lakh",
  "₹1–5 lakh",
  "₹5–15 lakh",
  "₹15–50 lakh",
  "₹50 lakh+",
  "Not sure yet",
];

const EMPTY: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  projectType: "",
  budget: "",
  message: "",
};

type Status = "idle" | "submitting" | "success" | "error";

const field =
  "w-full rounded-[var(--radius-sm)] border border-border-strong bg-background-elevated px-3.5 py-3 text-[0.9rem] text-foreground placeholder:text-faint outline-none transition-colors hover:border-[rgba(var(--ink-rgb),0.28)] focus:border-purple-light/70 focus:ring-2 focus:ring-purple-light/20";
const labelCls =
  "mb-1.5 block text-[0.72rem] uppercase tracking-[0.12em] text-muted";

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [submitted, setSubmitted] = useState<ContactFormValues>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  // false when the server has no email provider configured yet
  const [delivered, setDelivered] = useState(true);
  const errId = useId();
  const { t } = useT();

  // The estimator / call booker can pre-fill the form.
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const d = (e as CustomEvent<Partial<ContactFormValues>>).detail ?? {};
      setStatus("idle");
      setValues((v) => ({ ...v, ...d }));
    };
    window.addEventListener("ss:prefill", onPrefill);
    return () => window.removeEventListener("ss:prefill", onPrefill);
  }, []);

  const set = <K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) => setValues((v) => ({ ...v, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        delivered?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setSubmitted(values);
      setDelivered(data.delivered !== false);
      setStatus("success");
      sound.play("success");
      // #25 celebrate from the submit button
      const btn = (e.target as HTMLFormElement).querySelector('button[type="submit"]')?.getBoundingClientRect();
      burstConfetti(btn ? btn.left + btn.width / 2 : innerWidth / 2, btn ? btn.top : innerHeight / 2);
      setValues(EMPTY);
    } catch (err) {
      setSubmitted(values);
      setStatus("error");
      sound.play("error");
      setError(err instanceof Error ? err.message : "Unexpected error.");
    }
  };

  if (status === "success") {
    const waText = whatsappSummary(submitted);
    return (
      <div className="flex flex-col items-start gap-4 rounded-[var(--radius-lg)] border border-border-strong bg-surface p-8">
        <span className="grid h-11 w-11 place-items-center rounded-full border border-border-strong text-foreground">
          <ArrowRight className="h-5 w-5 -rotate-45" />
        </span>
        <h3 className="font-display text-lg font-semibold text-foreground">
          {delivered ? "Message sent" : "One last step"}
        </h3>
        <p className="text-[0.9rem] text-muted">
          {delivered
            ? "Thanks for reaching out — we'll reply within one working day. You can also send it straight to us on WhatsApp:"
            : "Tap a button below to send your details to us on WhatsApp — your message is already written for you."}
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {company.people.map((p) => (
            <a
              key={p.phoneHref}
              href={waLink(p.phoneHref, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border-strong px-4 py-2.5 text-[0.85rem] font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-[rgba(var(--ink-rgb),0.05)]"
            >
              <MessageCircle className="h-4 w-4 text-purple-light" />
              WhatsApp {p.name.split(" ")[0]}
            </a>
          ))}
        </div>
        <button suppressHydrationWarning
          type="button"
          onClick={() => setStatus("idle")}
          className="text-[0.9rem] font-medium text-foreground link-underline"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-lg)] border border-border-strong bg-surface p-6 shadow-[var(--card-shadow)] md:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>{t("form.name")} *</span>
          <input suppressHydrationWarning
            required
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={field}
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className={labelCls}>{t("form.email")} *</span>
          <input suppressHydrationWarning
            required
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            className={field}
            placeholder="you@company.com"
          />
        </label>
        <label className="block">
          <span className={labelCls}>{t("form.phone")}</span>
          <input suppressHydrationWarning
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={field}
            placeholder="+91 …"
          />
        </label>
        <label className="block">
          <span className={labelCls}>{t("form.company")}</span>
          <input suppressHydrationWarning
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
            className={field}
            placeholder="Company name"
          />
        </label>
        <label className="block">
          <span className={labelCls}>{t("form.type")}</span>
          <select suppressHydrationWarning
            value={values.projectType}
            onChange={(e) =>
              set("projectType", e.target.value as ProjectType | "")
            }
            className={cn(field, "appearance-none")}
          >
            <option value="">Select…</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t} className="bg-background">
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>{t("form.budget")}</span>
          <select suppressHydrationWarning
            value={values.budget}
            onChange={(e) => set("budget", e.target.value)}
            className={cn(field, "appearance-none")}
          >
            <option value="">Select…</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b} className="bg-background">
                {b}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-5 block">
        <span className={labelCls}>{t("form.message")} *</span>
        <textarea suppressHydrationWarning
          required
          rows={5}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={status === "error" || undefined}
          aria-describedby={status === "error" ? errId : undefined}
          className={cn(field, "resize-y")}
          placeholder={t("form.messagePh")}
        />
      </label>

      {status === "error" && (
        <div id={errId} role="alert" className="mt-4 space-y-3">
          <p className="text-[0.85rem] text-red-500">{error}</p>
          {submitted.name && submitted.message.trim().length > 0 && (
            <a
              href={waLink(company.people[0].phoneHref, whatsappSummary(submitted))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-[0.85rem] font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Send it on WhatsApp instead
            </a>
          )}
        </div>
      )}

      <button suppressHydrationWarning
        type="submit"
        disabled={status === "submitting"}
        className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple px-7 py-3.5 text-[0.9rem] font-medium text-white shadow-[0_8px_30px_-10px_var(--glow)] transition-all duration-300 ease-[var(--ease)] hover:bg-[color-mix(in_oklab,var(--purple)_88%,white)] hover:shadow-[0_14px_44px_-10px_var(--glow)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("form.sending")}
          </>
        ) : (
          <>
            {t("form.send")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>

      <p className="mt-3 text-[0.78rem] text-faint">
        {t("form.consent")}
      </p>
    </form>
  );
}
