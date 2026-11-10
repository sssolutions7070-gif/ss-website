"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { sound } from "@/lib/sound";

interface GoOptions {
  /** Image that grows from `from` to full screen (card → case study). */
  image?: string;
  from?: { x: number; y: number; w: number; h: number };
}
interface Ctx {
  go: (href: string, label?: string, accent?: string, opts?: GoOptions) => void;
}
const TransitionContext = createContext<Ctx>({ go: () => {} });

const EASE = [0.76, 0, 0.24, 1] as const;

interface State {
  label: string;
  accent: string;
  image?: string;
  from: { x: number; y: number; w: number; h: number };
}

/**
 * Page transition:
 *  1. a colour panel wipes up from the bottom (clip-path) with the page label;
 *     when an image is given it grows from the card's rect to fill the screen
 *  2. the route changes behind it
 *  3. the whole cover wipes off the top, revealing the new page.
 */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [state, setState] = useState<State | null>(null);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const startPath = useRef(pathname);

  const go = useCallback(
    (href: string, label = "", accent = "#6a46ff", opts: GoOptions = {}) => {
      if (reduced) {
        router.push(href);
        return;
      }
      startPath.current = window.location.pathname;
      sound.play("whoosh");
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const from = opts.from ?? { x: vw * 0.3, y: vh * 0.3, w: vw * 0.4, h: vh * 0.4 };
      setPhase("in");
      setState({ label, accent, image: opts.image, from });
      router.prefetch(href);
      window.setTimeout(() => router.push(href), opts.image ? 760 : 620);
    },
    [reduced, router],
  );

  // Once the new route has rendered: jump to top and wipe the cover away.
  useEffect(() => {
    if (!state || pathname === startPath.current) return;
    window.scrollTo(0, 0);
    const t = window.setTimeout(() => setPhase("out"), 180);
    const t2 = window.setTimeout(() => setState(null), 1100);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [pathname, state]);

  return (
    <TransitionContext.Provider value={{ go }}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            key="pt"
            aria-hidden
            className="fixed inset-0 z-[150] overflow-hidden"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={
              phase === "in"
                ? { clipPath: "inset(0% 0% 0% 0%)" }
                : { clipPath: "inset(0% 0% 100% 0%)" }
            }
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: phase === "in" ? 0.6 : 0.8, ease: EASE }}
          >
            {/* colour panel */}
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(90% 90% at 50% 30%, ${state.accent}, #0b0920 90%)` }}
            />
            {/* shared image: card rect → full screen */}
            {state.image && (
              <motion.div
                className="absolute overflow-hidden"
                initial={{
                  left: state.from.x,
                  top: state.from.y,
                  width: state.from.w,
                  height: state.from.h,
                  borderRadius: 28,
                }}
                animate={{ left: 0, top: 0, width: "100vw", height: "100vh", borderRadius: 0 }}
                transition={{ duration: 0.75, ease: EASE }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.image} alt="" className="h-full w-full object-cover object-top" />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to top, ${state.accent}e6, ${state.accent}55 55%, rgba(0,0,0,0.25))` }}
                />
              </motion.div>
            )}
            {/* label */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="overflow-hidden px-6 pb-2">
                <motion.span
                  className="block text-center font-display text-[clamp(2rem,1.2rem+3.6vw,4.4rem)] font-semibold tracking-[-0.03em] text-white [text-shadow:0_8px_40px_rgba(0,0,0,0.35)]"
                  initial={{ y: "110%" }}
                  animate={phase === "in" ? { y: "0%" } : { y: "-110%" }}
                  transition={{ duration: 0.6, delay: phase === "in" ? 0.25 : 0, ease: [0.22, 1, 0.36, 1] }}
                >
                  {state.label}
                </motion.span>
              </div>
            </div>
            {/* progress hairline */}
            <motion.span
              className="absolute bottom-10 left-1/2 h-px w-40 -translate-x-1/2 origin-left bg-white/70"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

export const usePageTransition = () => useContext(TransitionContext);

/**
 * A next/link that plays the page transition (normal link for new-tab clicks).
 * Pass `image` + `fromSelector` (or put `data-pt-from` on an element inside the
 * link) to make that image grow into the next page.
 */
export function TransitionLink({
  href,
  label,
  accent,
  image,
  fromSelector,
  className,
  children,
  onNavigate,
  magnetic,
}: {
  magnetic?: boolean;
  href: string;
  label?: string;
  accent?: string;
  image?: string;
  fromSelector?: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const { go } = usePageTransition();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    let from: GoOptions["from"];
    if (image) {
      const el =
        (fromSelector ? document.querySelector(fromSelector) : null) ??
        e.currentTarget.querySelector("[data-pt-from]");
      if (el) {
        const r = el.getBoundingClientRect();
        from = { x: r.left, y: r.top, w: r.width, h: r.height };
      }
    }
    onNavigate?.();
    go(href, label, accent, { image, from });
  };
  return (
    <Link href={href} onClick={onClick} className={className} data-cursor-label="Open" data-magnetic={magnetic || undefined}>
      {children}
    </Link>
  );
}
