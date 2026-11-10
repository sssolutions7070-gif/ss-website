"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Domain-warped fbm "aurora", weighted to the right (headline lives on the
// left), plus a soft glow that follows the cursor.
const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uLight;
  uniform float uFade;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * uAspect, uv.y) * 2.2;
    float t = uTime * 0.05;

    vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, 1.3) - t));
    float n = fbm(p + 2.0 * q + vec2(t * 1.5, -t));

    vec3 violet = vec3(0.416, 0.275, 1.0);
    vec3 blue = vec3(0.239, 0.388, 1.0);
    vec3 magenta = vec3(0.753, 0.149, 0.827);
    vec3 col = mix(violet, blue, smoothstep(0.25, 0.8, q.x));
    col = mix(col, magenta, smoothstep(0.55, 0.9, n) * 0.55);

    vec2 m = uMouse * 0.5 + 0.5;
    vec2 d = uv - m;
    d.x *= uAspect;
    float glow = exp(-dot(d, d) * 5.0);

    float bands = smoothstep(0.38, 0.88, n);
    float side = smoothstep(0.1, 0.9, uv.x);
    float edge = smoothstep(0.0, 0.25, uv.y) * smoothstep(1.0, 0.75, uv.y);
    float strength = mix(0.6, 0.5, uLight);
    float a = (bands * 0.75 * side + glow * 0.45) * edge * strength * uFade;

    gl_FragColor = vec4(col, a);
  }
`;

/**
 * Full-viewport shader backdrop for the hero. Fades out as the hero scrolls
 * away; cheap (one quad, one fragment shader).
 */
export function AuroraPlane({ light }: { light: boolean }) {
  const { viewport, camera, pointer, size } = useThree();
  const mouse = useRef(new THREE.Vector2(0.4, 0.1));
  const z = -5;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.4, 0.1) },
      uLight: { value: 0 },
      uFade: { value: 1 },
      uAspect: { value: 1 },
    }),
    [],
  );

  // Oversize so camera parallax never exposes the edges.
  const vp = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, z));

  const mat = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value += dt;
    mouse.current.lerp(pointer, 0.06);
    u.uMouse.value.copy(mouse.current);
    u.uLight.value = THREE.MathUtils.damp(u.uLight.value, light ? 1 : 0, 4, dt);
    u.uAspect.value = size.width / Math.max(1, size.height);
    const t = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 0.9));
    u.uFade.value = 1 - t;
  });

  return (
    <mesh position={[0, 0, z]} scale={[vp.width * 1.35, vp.height * 1.35, 1]} renderOrder={-1}>
      <planeGeometry />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
