"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Vector3Tuple } from "three";

interface GlowingSphereProps {
  position?: Vector3Tuple;
  radius?: number;
  color?: string;
}

/**
 * Wireframe icosahedron shell with a solid glowing core.
 * Reads as an "abstract digital core / node".
 */
export function GlowingSphere({
  position = [0, 0, 0],
  radius = 1,
  color = "#c4b5fd",
}: GlowingSphereProps) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.25;
    group.current.rotation.x -= delta * 0.1;
  });

  return (
    <group ref={group} position={position}>
      <mesh scale={radius}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>
      <mesh scale={radius * 0.55}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.9}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}
