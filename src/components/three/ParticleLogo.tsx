"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createRng } from "@/lib/utils";
import { sound } from "@/lib/sound";

/** Sample points inside the glyphs of `text` using an offscreen 2D canvas. */
function sampleText(text: string, count: number, width: number, seed: number) {
  const rng = createRng(seed);
  const c = document.createElement("canvas");
  c.width = 900;
  c.height = 420;
  const ctx = c.getContext("2d");
  const out = new Float32Array(count * 3);
  if (!ctx) return out;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "800 360px 'Space Grotesk', 'Segoe UI', Arial, sans-serif";
  ctx.fillText(text, c.width / 2, c.height / 2 + 10);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;

  const filled: number[] = [];
  for (let y = 0; y < c.height; y += 2) {
    for (let x = 0; x < c.width; x += 2) {
      if (data[(y * c.width + x) * 4 + 3] > 140) filled.push(x, y);
    }
  }
  const pairs = filled.length / 2;
  // Fit the glyphs' real bounding box (not the whole canvas) to `width`.
  let minX = c.width, maxX = 0, minY = c.height, maxY = 0;
  for (let i = 0; i < filled.length; i += 2) {
    minX = Math.min(minX, filled[i]);
    maxX = Math.max(maxX, filled[i]);
    minY = Math.min(minY, filled[i + 1]);
    maxY = Math.max(maxY, filled[i + 1]);
  }
  const cx = pairs > 0 ? (minX + maxX) / 2 : c.width / 2;
  const cy = pairs > 0 ? (minY + maxY) / 2 : c.height / 2;
  const scale = width / Math.max(1, maxX - minX);
  for (let i = 0; i < count; i++) {
    const k = pairs > 0 ? Math.floor(rng() * pairs) : 0;
    const x = (filled[k * 2] ?? c.width / 2) + (rng() - 0.5) * 1.2;
    const y = (filled[k * 2 + 1] ?? c.height / 2) + (rng() - 0.5) * 1.2;
    out[i * 3] = (x - cx) * scale;
    out[i * 3 + 1] = -(y - cy) * scale;
    out[i * 3 + 2] = (rng() - 0.5) * 0.2;
  }
  return out;
}

const vertex = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uSize;
  attribute vec3 aStart;
  attribute vec3 aTarget;
  attribute float aRand;
  varying float vAlpha;

  void main() {
    // Each particle travels on its own slightly delayed curve.
    float local = clamp(uProgress * 1.5 - aRand * 0.5, 0.0, 1.0);
    float e = local * local * (3.0 - 2.0 * local);
    vec3 pos = mix(aStart, aTarget, e);

    // idle drift
    pos.x += sin(uTime * 0.7 + aRand * 12.0) * 0.012;
    pos.y += cos(uTime * 0.6 + aRand * 9.0) * 0.012;

    // cursor pushes particles away
    vec2 dir = pos.xy - uMouse;
    float d = length(dir);
    pos.xy += normalize(dir + 1e-4) * max(0.0, 1.1 - d) * 0.55 * e;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aRand * 0.8) * (10.0 / -mv.z);
    vAlpha = 0.35 + 0.65 * e;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColor2;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, r);
    vec3 col = mix(uColor2, uColor, soft);
    gl_FragColor = vec4(col, soft * vAlpha);
  }
`;

/**
 * Thousands of particles that assemble into the "SS" mark when the section is
 * centred in the viewport, and scatter again as it scrolls away.
 */
export function ParticleLogo({ light, count }: { light: boolean; count: number }) {
  const { gl, viewport, pointer } = useThree();
  const mouse = useRef(new THREE.Vector2(99, 99));
  const progress = useRef(0);
  const formed = useRef(false);

  const geometry = useMemo(() => {
    // as wide as fits the canvas height too (glyphs are ~1.1:1 each, "SS" ~2.3:1)
    const width = Math.min(viewport.width * 0.72, viewport.height * 1.9, 9);
    const target = sampleText("SS", count, width, 7);
    const rng = createRng(11);
    const start = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = 5 + rng() * 6;
      start[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      start[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      start[i * 3 + 2] = r * Math.cos(phi) * 0.6 - 2;
      rand[i] = rng();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(target, 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
    g.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    return g;
    // viewport.width only matters at mount; avoid rebuilding on every resize tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uSize: { value: 2.8 * Math.min(2, gl.getPixelRatio()) },
      uColor: { value: new THREE.Color() },
      uColor2: { value: new THREE.Color() },
    }),
    [gl],
  );

  const mat = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    // Assembled when the canvas is centred in the viewport.
    const rect = gl.domElement.getBoundingClientRect();
    const vh = window.innerHeight;
    const centre = rect.top + rect.height / 2;
    // fully formed while within ±22% of the centre, scattered beyond ~80%
    const off = Math.abs(centre - vh / 2) / vh;
    const target = 1 - Math.min(1, Math.max(0, (off - 0.22) / 0.58));
    progress.current = THREE.MathUtils.damp(progress.current, target, 3, dt);
    // sound: sparkles swarm in as the "SS" forms, fall away as it scatters
    if (!formed.current && target > 0.85 && progress.current > 0.15) {
      formed.current = true;
      sound.play("assemble");
    } else if (formed.current && progress.current < 0.25) {
      formed.current = false;
      sound.play("scatter");
    }

    u.uProgress.value = progress.current;
    u.uTime.value += dt;

    const inside = Math.abs(pointer.x) < 1 && Math.abs(pointer.y) < 1;
    const goal = inside
      ? new THREE.Vector2((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2)
      : new THREE.Vector2(99, 99);
    mouse.current.lerp(goal, 0.12);
    u.uMouse.value.copy(mouse.current);

    u.uColor.value.set(light ? "#6a46ff" : "#c4b8ff");
    u.uColor2.value.set(light ? "#3d63ff" : "#7c5cff");
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
