"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Code2, Terminal, Smartphone } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHasPointer, useIsMobile } from "@/hooks/useMediaQuery";
import { sound } from "@/lib/sound";
import { getTilt, isTouchDevice } from "@/lib/deviceTilt";

/* ---------- code that "types" in the editor ---------- */
type Tok = [string, string]; // [className, text]
const CODE: Tok[][] = [
  [["text-[#c792ea]", "export async function "], ["text-[#82aaff]", "placeOrder"], ["text-[#e6e6e6]", "(cart: Cart) {"]],
  [["text-[#c792ea]", "  const "], ["text-[#e6e6e6]", "order = "], ["text-[#c792ea]", "await "], ["text-[#e6e6e6]", "api."], ["text-[#82aaff]", "orders"], ["text-[#e6e6e6]", ".create({"]],
  [["text-[#e6e6e6]", "    items: cart.items,"]],
  [["text-[#e6e6e6]", "    zone: "], ["text-[#c3e88d]", "'pune-narayangaon'"], ["text-[#e6e6e6]", ","]],
  [["text-[#e6e6e6]", "    payment: "], ["text-[#c3e88d]", "'upi'"], ["text-[#e6e6e6]", ","]],
  [["text-[#e6e6e6]", "  });"]],
  [["text-[#e6e6e6]", "  tracking."], ["text-[#82aaff]", "start"], ["text-[#e6e6e6]", "(order.id); "], ["text-[#5c6773]", "// live rider map"]],
  [["text-[#c792ea]", "  return "], ["text-[#e6e6e6]", "order;"]],
  [["text-[#e6e6e6]", "}"]],
];
const TOTAL = CODE.reduce((n, l) => n + l.reduce((m, [, t]) => m + t.length, 0), 0);

function TypedCode({ run }: { run: boolean }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? TOTAL : 0);
  useEffect(() => {
    if (!run || reduced) return;
    const id = window.setInterval(() => {
      setN((v) => {
        // key clicks only while characters are actually being typed
        if (v < TOTAL) sound.play("codeKey");
        return v >= TOTAL + 60 ? 0 : v + 2;
      });
    }, 38);
    return () => window.clearInterval(id);
  }, [run, reduced]);

  const count = reduced ? TOTAL : Math.min(n, TOTAL);
  // line that currently holds the caret
  let acc = 0;
  let caretLine = CODE.length - 1;
  for (let i = 0; i < CODE.length; i++) {
    acc += CODE[i].reduce((m, [, t]) => m + t.length, 0);
    if (acc >= count) {
      caretLine = i;
      break;
    }
  }
  // characters shown per token, computed up-front (no mutation during render)
  const visible: string[][] = [];
  let budget = count;
  for (const line of CODE) {
    visible.push(
      line.map(([, text]) => {
        const shown = text.slice(0, Math.max(0, budget));
        budget -= text.length;
        return shown;
      }),
    );
  }
  return (
    <pre className="font-[family-name:var(--font-mono)] text-[0.62rem] leading-[1.7] sm:text-[0.74rem]">
      {CODE.map((line, li) => (
        <div key={li} className="flex">
          <span className="w-6 shrink-0 select-none text-right text-[#4b5263] sm:w-7">{li + 1}</span>
          <span className="pl-3 sm:pl-4">
            {line.map(([cls], ti) => (
              <span key={ti} className={cls}>
                {visible[li][ti]}
              </span>
            ))}
            {li === caretLine && (
              <span className="ml-px inline-block h-[1.1em] w-[6px] translate-y-[2px] animate-pulse bg-[#82aaff]" />
            )}
          </span>
        </div>
      ))}
    </pre>
  );
}

/* ---------- one floating layer ---------- */
function Layer({
  z,
  y,
  children,
  label,
  icon,
  accent,
}: {
  z: MotionValue<number>;
  y: MotionValue<number>;
  children: ReactNode;
  label: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <motion.div
      style={{ z, y, transformStyle: "preserve-3d" }}
      className="absolute inset-0"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[18px] border border-white/10 shadow-[0_40px_80px_-30px_rgba(10,8,40,0.55)]">
        {children}
      </div>
      {/* label tag that sticks out to the side */}
      <div
        className="absolute -left-3 top-5 flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.7rem] font-semibold text-white shadow-lg sm:-left-6 sm:text-[0.78rem]"
        style={{ background: accent, transform: "translateZ(30px)" }}
      >
        {icon}
        {label}
      </div>
    </motion.div>
  );
}

export function DevStack() {
  const reduced = useReducedMotion();
  const hasPointer = useHasPointer();
  const isMobile = useIsMobile();
  const dz = isMobile ? 95 : 170;
  const dy = isMobile ? 42 : 70;
  const section = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  // 0 → stacked, 1 → fully exploded (peak in the middle of the section)
  const spread = useSpring(useTransform(scrollYProgress, [0.15, 0.45, 0.75, 0.95], [0, 1, 1, 0.2]), {
    stiffness: 90,
    damping: 22,
  });
  const gap = reduced ? 1 : undefined;
  const zTop = useTransform(spread, (s) => (gap ?? s) * dz);
  const zBottom = useTransform(spread, (s) => -(gap ?? s) * dz);
  const yTop = useTransform(spread, (s) => -(gap ?? s) * dy);
  const yBottom = useTransform(spread, (s) => (gap ?? s) * dy);
  const zero = useMotionValue(0);

  // pointer tilt
  const rx = useSpring(useMotionValue(55), { stiffness: 80, damping: 18 });
  const rz = useSpring(useMotionValue(-38), { stiffness: 80, damping: 18 });

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // phones: layers follow the device tilt (or scroll sway) while in view
  useEffect(() => {
    if (reduced || !inView || !isTouchDevice()) return;
    let raf = 0;
    const loop = () => {
      const t = getTilt();
      rx.set(55 - t.y * 28);
      rz.set(-38 + t.x * 32);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, rx, rz]);

  const onMove = (e: React.PointerEvent) => {
    if (!hasPointer || reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    rx.set(55 - y * 14);
    rz.set(-38 + x * 16);
  };
  const onLeave = () => {
    rx.set(55);
    rz.set(-38);
  };

  return (
    <section data-cursor-icon="code" ref={section} id="engineering" className="section overflow-hidden">
      <div className="container-page grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div>
          <SectionHeading
            eyebrow="How we build"
            title={"Code, ship,\nlive — in layers."}
            lead="Every product we deliver is real engineering underneath: typed code, automated builds and one-command deploys — so what you launch is fast, stable and easy to grow."
          />
          <ul className="mt-8 grid gap-3 text-[0.92rem] text-muted-strong">
            {[
              ["#6a46ff", "Clean, typed code you own — reviewed and documented"],
              ["#0ea5e9", "Automated build, tests and deploy on every change"],
              ["#16a34a", "Live on web and Play Store, monitored after launch"],
            ].map(([c, t]) => (
              <li key={t} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* 3D stage */}
        <div
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="relative mx-auto h-[380px] w-full max-w-[560px] sm:h-[520px] lg:h-[600px]"
          style={{ perspective: 1600 }}
          aria-hidden
        >
          <motion.div
            className="absolute left-1/2 top-1/2 h-[190px] w-[240px] -translate-x-1/2 -translate-y-1/2 sm:h-[300px] sm:w-[400px]"
            style={{ rotateX: rx, rotateZ: rz, transformStyle: "preserve-3d" }}
          >
            {/* bottom: live app */}
            <Layer z={zBottom} y={yBottom} label="Live" icon={<Smartphone className="h-3.5 w-3.5" />} accent="#16a34a">
              <div className="relative h-full w-full bg-white">
                <Image src="/work/bfs/website.png" alt="" fill sizes="400px" className="object-cover object-top" />
              </div>
            </Layer>

            {/* middle: terminal */}
            <Layer z={zero} y={zero} label="Ship" icon={<Terminal className="h-3.5 w-3.5" />} accent="#0ea5e9">
              <div className="h-full w-full bg-[#0b1020] p-4 font-[family-name:var(--font-mono)] text-[0.62rem] leading-[1.9] text-[#9fb0d0] sm:p-5 sm:text-[0.74rem]">
                <div className="mb-2 flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div><span className="text-[#c792ea]">$</span> npm run test</div>
                <div className="text-[#c3e88d]">✓ All tests passed</div>
                <div><span className="text-[#c792ea]">$</span> npm run build</div>
                <div className="text-[#c3e88d]">✓ Build compiled successfully</div>
                <div><span className="text-[#c792ea]">$</span> deploy --prod</div>
                <div className="text-[#82aaff]">→ Deployed to production · zero downtime</div>
              </div>
            </Layer>

            {/* top: code editor */}
            <Layer z={zTop} y={yTop} label="Code" icon={<Code2 className="h-3.5 w-3.5" />} accent="#6a46ff">
              <div className="h-full w-full bg-[#11131c]">
                <div className="flex items-center gap-2 border-b border-white/5 bg-[#0c0e15] px-4 py-2 text-[0.62rem] text-[#7f8aa3] sm:text-[0.7rem]">
                  <span className="rounded bg-white/5 px-2 py-0.5 text-[#e6e6e6]">order.ts</span>
                  <span>api.ts</span>
                  <span>tracking.ts</span>
                </div>
                <div className="p-3 sm:p-4">
                  <TypedCode run={inView} />
                </div>
              </div>
            </Layer>
          </motion.div>

          {/* floor glow */}
          <div className="pointer-events-none absolute inset-x-[10%] bottom-[8%] h-24 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--purple)_28%,transparent),transparent)] blur-2xl" />
        </div>
      </div>
    </section>
  );
}
