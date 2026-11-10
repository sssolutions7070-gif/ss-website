"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DigitalGridProps {
  /** Grid half-size in world units. */
  size?: number;
  divisions?: number;
  color?: string;
  y?: number;
  opacity?: number;
}

/**
 * Receding futuristic floor grid built from LineSegments (cheap, no shader).
 * Gently pulses and scrolls toward the camera.
 */
export function DigitalGrid({
  size = 30,
  divisions = 30,
  color = "#8b5cf6",
  y = -3.2,
  opacity = 0.25,
}: DigitalGridProps) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.LineBasicMaterial>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.position.z = (state.clock.elapsedTime * 0.6) % (size / divisions);
    }
    if (mat.current) {
      mat.current.opacity =
        opacity + Math.sin(state.clock.elapsedTime * 1.5) * opacity * 0.25;
    }
  });

  return (
    <group ref={group} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper args={[size * 2, divisions * 2]}>
        <lineBasicMaterial
          ref={mat}
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </gridHelper>
    </group>
  );
}
