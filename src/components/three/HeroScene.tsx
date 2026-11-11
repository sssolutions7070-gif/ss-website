"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Float } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { LogoMark3D } from "./LogoMark3D";
import { HolographicPanel } from "./HolographicPanel";
import { AuroraPlane } from "./AuroraPlane";
import { getTilt, isTouchDevice } from "@/lib/deviceTilt";

/** Eases the camera a little with the pointer for parallax depth. */
function Rig({ intensity = 1 }: { intensity?: number }) {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3());
  // phones have no mouse: use the gyroscope / scroll sway instead
  const touch = useRef(isTouchDevice());

  useFrame(() => {
    const t = touch.current ? getTilt() : null;
    const px = t ? t.x * 2 : pointer.x;
    const py = t ? -t.y * 2 : pointer.y;
    target.current.set(px * 0.6 * intensity, 0.15 + py * 0.35 * intensity, 9);
    camera.position.lerp(target.current, 0.04);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/**
 * Hero environment. The story is "we build digital products", so the scene is
 * the mark being crafted: a reflective metal "SS" with two quiet UI windows at
 * depth. No floor grid, no particle storm. Reflections come from an inline
 * lighting rig (no HDR download).
 */
export function HeroScene() {
  const isMobile = useIsMobile();
  const light = useTheme().theme === "light";
  const scrollGroup = useRef<THREE.Group>(null);

  // Scroll-reactive: the mark turns and lifts away as the hero scrolls out.
  useFrame((_, dt) => {
    const g = scrollGroup.current;
    if (!g) return;
    const t = Math.min(1.4, window.scrollY / Math.max(1, window.innerHeight));
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, t * 1.1, 5, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -t * 0.18, 5, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, t * 1.6, 5, dt);
  });

  return (
    <>
      <fog attach="fog" args={[light ? "#f6f6fa" : "#08080b", 11, 24]} />
      <ambientLight intensity={light ? 0.55 : 0.25} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-6, -2, -4]} intensity={0.9} color="#7c5cff" />

      {/* inline reflection rig — baked once, cheap */}
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2} position={[3, 3, 4]} scale={[6, 6, 1]} color="#ffffff" />
        <Lightformer intensity={light ? 1.6 : 1.3} position={[-4, 1, 2]} scale={[5, 5, 1]} color={light ? "#f0abfc" : "#8a6dff"} />
        <Lightformer intensity={light ? 1.1 : 0.8} position={[0, -4, 1]} scale={[8, 3, 1]} color={light ? "#67e8f9" : "#3b7bff"} />
      </Environment>

      <Rig intensity={isMobile ? 0.9 : 1} />

      {/* living shader backdrop: flowing colour + cursor glow */}
      <AuroraPlane light={light} />

      {/* pushed right so the headline column stays clear */}
      {/* phones: tucked into the lower-right so the headline stays readable */}
      <group position={isMobile ? [0.95, -2.3, -1] : [2.1, 0.1, 0]}>
        <group ref={scrollGroup}>
          <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
            <LogoMark3D scale={isMobile ? 0.72 : 1.55} light={light} />
          </Float>
        </group>

        {isMobile && (
          <HolographicPanel
            position={[0.55, 5.35, -2.4]}
            rotation={[0.08, -0.45, -0.04]}
            width={1.7}
            height={1.15}
            light={light}
            opacity={0.5}
          />
        )}
        {!isMobile && (
          <>
            <HolographicPanel
              position={[-2.9, 1.7, -1.6]}
              rotation={[0.06, 0.6, 0.05]}
              width={2.5}
              height={1.7}
              light={light}
            />
            <HolographicPanel
              position={[2.4, -1.4, -0.8]}
              rotation={[0.03, -0.5, -0.04]}
              width={1.9}
              height={2.4}
              accent="#3b7bff"
              speed={0.85}
              light={light}
              opacity={0.42}
            />
          </>
        )}
      </group>
    </>
  );
}
