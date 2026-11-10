"use client";

import { motion } from "framer-motion";
import { MessageCircle, PhoneCall, FileText } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const STEPS = [
  { icon: MessageCircle, title: "We reply within a day", text: "A real reply from one of the founders — not an auto-responder.", color: "#6a46ff" },
  { icon: PhoneCall, title: "Free discovery call", text: "30 minutes to understand your goals, users and budget.", color: "#3d63ff" },
  { icon: FileText, title: "Clear proposal", text: "Scope, timeline and a clear quote — before any work starts.", color: "#c026d3" },
];

/** Small vertical timeline: what happens after the form is sent. */
export function WhatsNext() {
  const reduced = useReducedMotion();
  return (
    <div className="mt-10 border-t border-border pt-8">
      <p className="t-label">What happens next</p>
      <ol className="relative mt-6 space-y-6">
        {/* connecting line draws in when visible */}
        <motion.span
          aria-hidden
          className="absolute bottom-5 left-[19px] top-5 w-px origin-top bg-[linear-gradient(180deg,#6a46ff,#3d63ff,#c026d3)]"
          initial={reduced ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        {STEPS.map((s, i) => (
          <motion.li
            key={s.title}
            className="relative flex gap-4"
            initial={reduced ? false : { opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full text-white shadow-lg"
              style={{ background: s.color, boxShadow: `0 10px 24px -10px ${s.color}` }}
            >
              <s.icon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div className="pt-0.5">
              <p className="font-display text-[0.98rem] font-semibold text-foreground">
                <span className="mr-2 font-[family-name:var(--font-mono)] text-[0.7rem] text-faint">0{i + 1}</span>
                {s.title}
              </p>
              <p className="mt-1 text-[0.86rem] leading-relaxed text-muted">{s.text}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
