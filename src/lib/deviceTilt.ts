"use client";

/**
 * Phone replacement for "the 3D follows your mouse".
 * Gives a smoothed tilt value { x, y } in roughly -0.5..0.5:
 *  - from the gyroscope (DeviceOrientation) where the browser allows it
 *    without a permission prompt (Android Chrome, Samsung Internet, …)
 *  - otherwise from scroll position + a slow sway, so the 3D still moves
 *    on iPhones (which require a permission pop-up for motion sensors).
 * Only active on touch / no-hover devices; desktop keeps the mouse.
 */
let started = false;
let gyro = false;
let gx = 0;
let gy = 0;
let baseBeta: number | null = null;
const out = { x: 0, y: 0 };

export const isTouchDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    gyro = true;
    if (baseBeta === null) baseBeta = e.beta; // hold-angle when the page opened = neutral
    gx = Math.max(-1, Math.min(1, e.gamma / 30)) * 0.5;
    gy = Math.max(-1, Math.min(1, (e.beta - baseBeta) / 30)) * 0.5;
  };
  window.addEventListener("deviceorientation", onOrient, { passive: true });
}

/** Current smoothed tilt. Call every frame (cheap). */
export function getTilt() {
  start();
  let tx: number;
  let ty: number;
  if (gyro) {
    tx = gx;
    ty = gy;
  } else {
    const t = performance.now() / 1000;
    const s = window.scrollY;
    tx = Math.sin(s / 520 + t * 0.35) * 0.32;
    ty = Math.cos(s / 640 + t * 0.27) * 0.22;
  }
  out.x += (tx - out.x) * 0.08;
  out.y += (ty - out.y) * 0.08;
  return out;
}

/**
 * Drive a DOM element's transform from the tilt while it's on screen.
 * Returns a cleanup function.
 */
export function bindTilt(el: HTMLElement, apply: (x: number, y: number) => string) {
  let raf = 0;
  let visible = false;
  const loop = () => {
    const { x, y } = getTilt();
    el.style.transform = apply(x, y);
    raf = visible ? requestAnimationFrame(loop) : 0;
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  });
  io.observe(el);
  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
  };
}
