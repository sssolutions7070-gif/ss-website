"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

/**
 * Device-tier check, run once on the client:
 * no WebGL, Data Saver, ≤2 GB RAM or ≤2 CPU cores → skip 3D and show the
 * static fallback (same layout, same content, no lag on weak phones).
 */
function detect(): boolean {
  if (cached !== null) return cached;
  try {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    const webgl = !!gl;
    // No GPU (SwiftShader / llvmpipe / "Microsoft Basic Render") → WebGL runs on the CPU and lags.
    let software = false;
    if (gl) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      software = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
    const lowCpu = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2;
    const saveData = nav.connection?.saveData === true;
    cached = webgl && !software && !lowMemory && !lowCpu && !saveData;
  } catch {
    cached = false;
  }
  return cached;
}

const noop = () => () => {};

/** true when this device should render the WebGL scenes. False during SSR. */
export function useCan3D(): boolean {
  return useSyncExternalStore(noop, detect, () => false);
}
