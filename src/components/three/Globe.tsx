"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const R = 2;
const T = "/textures/earth/";
const TEXTURES = [
  `${T}earth_atmos_2048.jpg`,
  `${T}earth_normal_2048.jpg`,
  `${T}earth_specular_2048.jpg`,
  `${T}earth_lights_2048.png`,
  `${T}earth_clouds_1024.png`,
];

/** lat/lon (degrees) → point on the sphere (matches three's sphere UVs). */
function toVec(lat: number, lon: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

const PUNE = { lat: 18.52, lon: 73.86 };
/** Indian cities we work with clients in (arcs from Pune). */
const DESTS = [
  { lat: 19.08, lon: 72.88 }, // Mumbai
  { lat: 12.97, lon: 77.59 }, // Bengaluru
  { lat: 28.61, lon: 77.21 }, // Delhi
  { lat: 17.39, lon: 78.49 }, // Hyderabad
  { lat: 13.08, lon: 80.27 }, // Chennai
  { lat: 22.57, lon: 88.36 }, // Kolkata
  { lat: 23.02, lon: 72.57 }, // Ahmedabad
  { lat: 26.91, lon: 75.79 }, // Jaipur
  { lat: 21.15, lon: 79.09 }, // Nagpur
];

function arcPoints(a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.setLength(R * (1.02 + a.distanceTo(b) * 0.28));
  return new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(48);
}

/* Soft blue rim glow (fresnel) — the thin atmosphere around the planet. */
const atmoVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const atmoFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    // fresnel rim: transparent facing us, glowing toward the planet's edge
    float f = pow(1.0 - clamp(dot(vNormal, vView), 0.0, 1.0), uPower);
    gl_FragColor = vec4(uColor, f * 0.95);
  }
`;

/**
 * Realistic Earth: colour, terrain relief, ocean shine, drifting clouds,
 * city lights (dark theme) and an atmosphere glow. India faces the viewer;
 * arcs draw out from Pune to Indian cities.
 */
export function Globe({ light }: { light: boolean }) {
  const [map, normal, spec, lights, clouds] = useTexture(TEXTURES, (tex) => {
    const list = Array.isArray(tex) ? tex : [tex];
    list[0].colorSpace = THREE.SRGBColorSpace;
    list[0].anisotropy = 8;
    list[3].colorSpace = THREE.SRGBColorSpace;
  });

  const group = useRef<THREE.Group>(null);
  const cloudMesh = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);

  const pune = useMemo(() => toVec(PUNE.lat, PUNE.lon, R * 1.004), []);
  const lines = useMemo(
    () =>
      DESTS.map(
        (d, i) =>
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(arcPoints(pune, toVec(d.lat, d.lon, R * 1.004))),
            new THREE.LineBasicMaterial({ color: i % 2 ? "#ffd166" : "#ffffff", transparent: true, opacity: 0.95 }),
          ),
      ),
    [pune],
  );
  const ends = useMemo(() => DESTS.map((d) => toVec(d.lat, d.lon, R * 1.006)), []);
  const atmoUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#5b7cff") }, uPower: { value: 3.0 } }),
    [],
  );

  // Face India: rotate so Pune sits at the front, tilted toward its latitude.
  const startY = useMemo(() => -Math.atan2(pune.x, pune.z), [pune]);
  const startX = ((PUNE.lat * Math.PI) / 180) * 0.85;

  const intro = useRef(true);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    // #11 arrive spun away and small, then rotate to Pune and zoom in
    if (g && intro.current) {
      intro.current = false;
      g.rotation.y = startY + Math.PI * 1.6;
      g.scale.setScalar(0.82);
    }
    if (g) g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, 1, 1.6, dt));
    if (g) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, startY + Math.sin(t * 0.2) * 0.28 + state.pointer.x * 0.18, 3, dt);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, startX - state.pointer.y * 0.1, 3, dt);
    }
    if (cloudMesh.current) cloudMesh.current.rotation.y += dt * 0.012;
    if (pulse.current) {
      const k = (t * 0.7) % 1;
      pulse.current.scale.setScalar(1 + k * 2.6);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - k);
    }
    lines.forEach((line, i) => {
      const phase = ((t * 0.35 + i * 0.29) % 1.6) / 1.1;
      line.geometry.setDrawRange(0, Math.round(Math.min(1, phase) * 49));
    });
  });

  return (
    <>
      <ambientLight intensity={light ? 0.6 : 0.25} />
      {/* "sun" from the upper-left front, so India is lit */}
      <directionalLight position={[1.5, 2, 6]} intensity={light ? 2.3 : 2.0} />

      <group ref={group} rotation={[startX, startY, 0]}>
        <mesh>
          <sphereGeometry args={[R, 96, 96]} />
          <meshPhongMaterial
            map={map}
            normalMap={normal}
            normalScale={new THREE.Vector2(0.85, 0.85)}
            specularMap={spec}
            specular={new THREE.Color("#5a6f99")}
            shininess={14}
            emissiveMap={lights}
            emissive={new THREE.Color(light ? "#000000" : "#ffcf7a")}
            emissiveIntensity={light ? 0 : 0.5}
          />
        </mesh>

        <mesh ref={cloudMesh} scale={1.012}>
          <sphereGeometry args={[R, 64, 64]} />
          <meshPhongMaterial map={clouds} transparent opacity={0.5} depthWrite={false} />
        </mesh>

        {lines.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
        {ends.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshBasicMaterial color="#ffd166" />
          </mesh>
        ))}
        <mesh position={pune}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial color="#c4b5fd" />
        </mesh>
        <mesh ref={pulse} position={pune}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.6} depthWrite={false} />
        </mesh>
      </group>

      {/* atmosphere rim glow */}
      <mesh scale={1.035}>
        <sphereGeometry args={[R, 64, 64]} />
        <shaderMaterial
          vertexShader={atmoVertex}
          fragmentShader={atmoFragment}
          uniforms={atmoUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

useTexture.preload(TEXTURES);
