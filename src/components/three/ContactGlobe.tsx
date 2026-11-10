"use client";

import dynamic from "next/dynamic";
import { SceneMount } from "./SceneMount";
import { useTheme } from "@/hooks/useTheme";

const Globe = dynamic(() => import("./Globe").then((m) => m.Globe), { ssr: false });

/** 3D globe for the Contact section: based in Pune, working with clients anywhere. */
export function ContactGlobe() {
  const light = useTheme().theme === "light";
  return (
    <div className="relative mt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[10%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--purple)_18%,transparent),transparent_70%)] blur-2xl"
      />
      <SceneMount className="relative aspect-square w-full max-w-[380px]" camera={{ position: [0, 0, 6.6], fov: 40 }}>
        <Globe light={light} />
      </SceneMount>
      <p className="mt-2 flex items-center gap-2 text-[0.82rem] text-muted">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple" />
        </span>
        Based in Pune — working with clients across India
      </p>
    </div>
  );
}
