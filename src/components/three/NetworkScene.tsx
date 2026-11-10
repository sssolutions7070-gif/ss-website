"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createRng } from "@/lib/utils";

interface NetworkSceneProps {
  nodeCount?: number;
  spread?: number;
  color?: string;
  linkColor?: string;
  /** Max distance to draw a link between two nodes. */
  linkDistance?: number;
}

/**
 * A connected node network: glowing points joined by faint lines to their
 * near neighbours. The whole graph drifts and reacts to the pointer.
 */
export function NetworkScene({
  nodeCount = 34,
  spread = 6,
  color = "#c4b5fd",
  linkColor = "#8b5cf6",
  linkDistance = 2.4,
}: NetworkSceneProps) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const { nodes, linePositions } = useMemo(() => {
    const rand = createRng(nodeCount * 7919 + Math.round(spread * 131));
    const n: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      n.push(
        new THREE.Vector3(
          (rand() - 0.5) * spread * 2,
          (rand() - 0.5) * spread * 1.3,
          (rand() - 0.5) * spread,
        ),
      );
    }
    const lp: number[] = [];
    for (let i = 0; i < n.length; i++) {
      for (let j = i + 1; j < n.length; j++) {
        if (n[i].distanceTo(n[j]) < linkDistance) {
          lp.push(n[i].x, n[i].y, n[i].z, n[j].x, n[j].y, n[j].z);
        }
      }
    }
    return { nodes: n, linePositions: new Float32Array(lp) };
  }, [nodeCount, spread, linkDistance]);

  const nodePositions = useMemo(() => {
    const arr = new Float32Array(nodes.length * 3);
    nodes.forEach((v, i) => {
      arr[i * 3] = v.x;
      arr[i * 3 + 1] = v.y;
      arr[i * 3 + 2] = v.z;
    });
    return arr;
  }, [nodes]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.04;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      pointer.y * 0.2,
      0.04,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      pointer.x * 0.1,
      0.04,
    );
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
  });

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={linkColor}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.09}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
