"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";

/** One "S" as a smooth tube along a Catmull-Rom curve. */
function useSGeometry(tube = 0.135) {
  return useMemo(() => {
    const pts = [
      new THREE.Vector3(0.58, 1.02, 0),
      new THREE.Vector3(-0.06, 1.12, 0.04),
      new THREE.Vector3(-0.62, 0.66, 0),
      new THREE.Vector3(-0.54, 0.16, -0.04),
      new THREE.Vector3(0.12, 0.0, 0),
      new THREE.Vector3(0.6, -0.16, 0.04),
      new THREE.Vector3(0.6, -0.7, 0),
      new THREE.Vector3(-0.03, -1.12, -0.03),
      new THREE.Vector3(-0.64, -1.02, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
    return new THREE.TubeGeometry(curve, 110, tube, 14, false);
  }, [tube]);
}

interface LogoMark3DProps {
  scale?: number;
  /** light theme: chrome reads grey on white, so use two glossy brand colours */
  light?: boolean;
}

/**
 * The abstract "SS" mark as a crafted metal object: two offset S-tubes with a
 * subtle depth split, held in a slow, weighted drift (not a spin). Reads as a
 * product that was built — which is the whole point of the hero.
 */
export function LogoMark3D({ scale = 1, light = false }: LogoMark3DProps) {
  const group = useRef<Group>(null);
  const sGeo = useSGeometry();
  // #1 poke: extra spin + scale pulse that eases out
  const spin = useRef(0);
  const pulse = useRef(0);
  useEffect(() => {
    const onPoke = () => {
      spin.current += Math.PI * 2;
      pulse.current = 1;
    };
    window.addEventListener("ss:hero-poke", onPoke);
    return () => window.removeEventListener("ss:hero-poke", onPoke);
  }, []);

  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    spin.current = THREE.MathUtils.damp(spin.current, 0, 3.2, dt);
    pulse.current = THREE.MathUtils.damp(pulse.current, 0, 4, dt);
    group.current.scale.setScalar(scale * (1 + Math.sin(pulse.current * Math.PI) * 0.12));
    group.current.rotation.y = Math.sin(t * 0.28) * 0.42 + spin.current;
    group.current.rotation.x = Math.sin(t * 0.19) * 0.12;
    group.current.position.y = Math.sin(t * 0.5) * 0.06;
  });

  return (
    <group ref={group} scale={scale}>
      <mesh geometry={sGeo} position={[-0.32, 0, 0.12]} castShadow>
        {light ? (
          <meshStandardMaterial
            color="#5b3df5"
            metalness={0.55}
            roughness={0.16}
            emissive="#2b1b9e"
            emissiveIntensity={0.18}
            envMapIntensity={1.7}
          />
        ) : (
          <meshStandardMaterial color="#e9e6ff" metalness={0.92} roughness={0.22} envMapIntensity={1.4} />
        )}
      </mesh>
      <mesh geometry={sGeo} position={[0.5, 0, -0.16]}>
        {light ? (
          <meshStandardMaterial
            color="#d36cf2"
            metalness={0.5}
            roughness={0.2}
            emissive="#8b2fd0"
            emissiveIntensity={0.22}
            envMapIntensity={1.5}
          />
        ) : (
          <meshStandardMaterial
            color="#8a6dff"
            metalness={0.85}
            roughness={0.3}
            emissive="#4a34c9"
            emissiveIntensity={0.28}
            envMapIntensity={1.1}
          />
        )}
      </mesh>
    </group>
  );
}
