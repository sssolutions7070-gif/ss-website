"use client";

import { Float, RoundedBox } from "@react-three/drei";
import type { Vector3Tuple } from "three";

interface HolographicPanelProps {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  width?: number;
  height?: number;
  accent?: string;
  speed?: number;
  opacity?: number;
}

/**
 * A frosted UI surface — a browser/app window abstracted to a header bar and a
 * few content rows. Deliberately quiet: no neon edges, low contrast, sits at
 * depth behind the mark.
 */
export function HolographicPanel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 2.4,
  height = 1.6,
  accent = "#8a6dff",
  speed = 1,
  opacity = 0.5,
  light = false,
}: HolographicPanelProps & { light?: boolean }) {
  const pad = 0.2;
  const innerW = width - pad * 2;
  const rows = [0.74, 0.52, 0.63, 0.4];

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.7}>
      <group position={position} rotation={rotation}>
        <RoundedBox args={[width, height, 0.04]} radius={0.06} smoothness={4}>
          <meshStandardMaterial
            color={light ? "#ffffff" : "#0f0f14"}
            transparent
            opacity={light ? Math.min(1, opacity + 0.35) : opacity}
            roughness={0.5}
            metalness={0.2}
          />
        </RoundedBox>

        {/* header dots */}
        {[-1, 0, 1].map((i) => (
          <mesh key={i} position={[-innerW / 2 + 0.12 + i * 0.13 + 0.13, height / 2 - pad, 0.03]}>
            <circleGeometry args={[0.028, 16]} />
            <meshBasicMaterial color={light ? ["#ff8a80", "#ffd166", "#6ee7b7"][i + 1] : "#3a3a44"} />
          </mesh>
        ))}

        {/* content rows */}
        {rows.map((w, i) => (
          <mesh
            key={i}
            position={[-innerW / 2 + (innerW * w) / 2, height / 2 - pad - 0.34 - i * 0.24, 0.03]}
          >
            <planeGeometry args={[innerW * w, 0.05]} />
            <meshBasicMaterial
              color={i === 0 ? accent : light ? "#c4b5fd" : "#4a4a55"}
              transparent
              opacity={i === 0 ? 0.6 : light ? 0.55 : 0.35}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}
