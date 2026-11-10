"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * #12 A list whose items fall in from above and bounce into a stack the first
 * time it scrolls into view (items read their order from `--i`).
 */
export function FallList({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <ul ref={ref} className={`fall-list ${className ?? ""}`} data-in={inView || undefined}>
      {children}
    </ul>
  );
}
