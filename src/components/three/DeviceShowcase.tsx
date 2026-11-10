"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  RoundedBox,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { sound } from "@/lib/sound";

export interface ShowcaseStage {
  laptop: string;
  phone: string;
}

const SCREEN_W = 3.3;
const SCREEN_H = SCREEN_W / 1.6; // 16:10
const LID_H = SCREEN_H + 0.28;
const PHONE_SCREEN_W = 0.86;
const PHONE_SCREEN_H = 1.86;

/** Crop a texture like CSS `object-fit: cover`, anchored to the top. */
function cover(tex: THREE.Texture, planeAspect: number) {
  const img = tex.image as { width: number; height: number } | undefined;
  if (!img?.width) return tex;
  const imgAspect = img.width / img.height;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  if (imgAspect > planeAspect) {
    tex.repeat.set(planeAspect / imgAspect, 1);
    tex.offset.set((1 - tex.repeat.x) / 2, 0);
  } else {
    tex.repeat.set(1, imgAspect / planeAspect);
    tex.offset.set(0, 1 - tex.repeat.y);
  }
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * A stack of screen planes that cross-fade: plane i fades in on top of the
 * ones below as the stage value passes i - 1 → i.
 */
function ScreenStack({
  textures,
  width,
  height,
  stage,
  browse = false,
}: {
  textures: THREE.Texture[];
  width: number;
  height: number;
  stage: RefObject<number>;
  /** #10 laptop: slowly zoom/pan the page + a cursor that moves and clicks, like someone browsing */
  browse?: boolean;
}) {
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const cursor = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const target = useRef({ x: 0, y: 0, next: 0, click: 0 });
  useFrame((state, dt) => {
    const s = stage.current ?? 0;
    if (browse) {
      const t = state.clock.elapsedTime;
      textures.forEach((tex, i) => {
        const base = (tex.userData.base ??= { rx: tex.repeat.x, ry: tex.repeat.y, ox: tex.offset.x, oy: tex.offset.y });
        const z = 0.86 + Math.sin(t * 0.18 + i) * 0.04; // gentle zoom
        tex.repeat.set(base.rx * z, base.ry * z);
        const freeX = base.rx - base.rx * z;
        const freeY = base.ry - base.ry * z;
        tex.offset.set(base.ox + freeX * (0.5 + 0.5 * Math.sin(t * 0.23 + i * 2)), base.oy + freeY * (0.5 + 0.5 * Math.cos(t * 0.17 + i)));
      });
      // cursor wanders to a new spot every ~2s and "clicks" when it arrives
      const tg = target.current;
      if (t > tg.next) {
        tg.x = (Math.random() - 0.5) * width * 0.75;
        tg.y = (Math.random() - 0.5) * height * 0.7;
        tg.next = t + 1.6 + Math.random() * 1.2;
        tg.click = t + 0.9;
      }
      const c = cursor.current;
      if (c) {
        c.position.x = THREE.MathUtils.damp(c.position.x, tg.x, 3, dt);
        c.position.y = THREE.MathUtils.damp(c.position.y, tg.y, 3, dt);
      }
      const r = ring.current;
      if (r) {
        const k = THREE.MathUtils.clamp((t - tg.click) / 0.5, 0, 1);
        r.scale.setScalar(0.2 + k * 1.6);
        (r.material as THREE.MeshBasicMaterial).opacity = t >= tg.click ? 0.6 * (1 - k) : 0;
      }
    }
    // Screen i is fully shown for stage u in [i, i+1); the swap happens in a
    // short window around each boundary so screens never ghost over each other.
    mats.current.forEach((m, i) => {
      if (m) m.opacity = i === 0 ? 1 : smooth(clamp01((s - i + 0.12) / 0.24));
    });
  });
  return (
    <>
      {textures.map((t, i) => (
        <mesh key={t.uuid} position={[0, 0, i * 0.002]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            ref={(m) => {
              mats.current[i] = m;
            }}
            map={t}
            toneMapped={false}
            transparent={i > 0}
            opacity={i === 0 ? 1 : 0}
            depthWrite={i === 0}
          />
        </mesh>
      ))}
      {browse && (
        <group ref={cursor} position={[0, 0, 0.02]}>
          <mesh>
            <circleGeometry args={[0.035, 20]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.001]}>
            <circleGeometry args={[0.05, 20]} />
            <meshBasicMaterial color="#6a46ff" toneMapped={false} />
          </mesh>
          <mesh ref={ring} position={[0, 0, 0.001]}>
            <ringGeometry args={[0.06, 0.075, 32]} />
            <meshBasicMaterial color="#6a46ff" transparent opacity={0} toneMapped={false} />
          </mesh>
        </group>
      )}
    </>
  );
}

/**
 * Laptop + phone that display real project screens. Scroll progress (0..1,
 * read from `progress`) opens the lid, turns the devices and swaps screens.
 */
export function DeviceShowcase({
  stages,
  progress,
}: {
  stages: ShowcaseStage[];
  progress: RefObject<number>;
}) {
  const isMobile = useIsMobile();
  const light = useTheme().theme === "light";
  const { pointer } = useThree();

  const urls = useMemo(
    () => [...stages.map((s) => s.laptop), ...stages.map((s) => s.phone)],
    [stages],
  );
  const loaded = useTexture(urls);
  const laptopTex = useMemo(
    () => loaded.slice(0, stages.length).map((t) => cover(t, SCREEN_W / SCREEN_H)),
    [loaded, stages.length],
  );
  const phoneTex = useMemo(
    () => loaded.slice(stages.length).map((t) => cover(t, PHONE_SCREEN_W / PHONE_SCREEN_H)),
    [loaded, stages.length],
  );

  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const lidOpen = useRef(false);
  const phone = useRef<THREE.Group>(null);
  const stage = useRef(0);
  const smoothP = useRef(0);

  useFrame((_, dt) => {
    const target = progress.current ?? 0;
    smoothP.current = THREE.MathUtils.damp(smoothP.current, target, 6, dt);
    const p = smoothP.current;

    // 0 → 0.1: lid opens. Then the stages share the rest of the scroll
    // (same split the captions use, so text and screens change together).
    const open = smooth(clamp01(p / 0.1));
    stage.current = clamp01((p - 0.1) / 0.9) * stages.length;

    if (lid.current) {
      lid.current.rotation.x = THREE.MathUtils.lerp(1.05, -0.22, open);
    }
    // sound: hinge + boot chime as the lid opens, soft thud when it closes again
    if (!lidOpen.current && open > 0.6) {
      lidOpen.current = true;
      sound.play("lidOpen");
    } else if (lidOpen.current && open < 0.25) {
      lidOpen.current = false;
      sound.play("lidClose");
    }
    if (root.current) {
      root.current.rotation.y = THREE.MathUtils.lerp(-0.5, 0.18, p) + pointer.x * 0.1;
      root.current.rotation.x = THREE.MathUtils.lerp(0.18, 0.04, open) - pointer.y * 0.05;
    }
    if (phone.current) {
      // The phone slides in once the lid is open, and flips a little per stage.
      phone.current.position.x = THREE.MathUtils.lerp(3.6, isMobile ? 1.55 : 1.85, open);
      phone.current.rotation.y = -0.38 + Math.sin(stage.current * Math.PI) * 0.18;
    }
  });

  const body = light ? "#e3e4ee" : "#24252c";
  const bezel = "#0b0b0f";

  return (
    <>
      <ambientLight intensity={light ? 0.7 : 0.35} />
      <directionalLight position={[3, 6, 5]} intensity={1.4} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2} position={[3, 4, 4]} scale={[6, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-5, 1, 2]} scale={[5, 5, 1]} color={light ? "#c4b5fd" : "#8a6dff"} />
        <Lightformer intensity={0.8} position={[0, -3, 2]} scale={[8, 3, 1]} color={light ? "#a5f3fc" : "#3d63ff"} />
      </Environment>

      <group ref={root} position={[isMobile ? -0.4 : 0.1, isMobile ? -0.75 : -0.8, 0]} scale={isMobile ? 0.8 : 0.88}>
        {/* Laptop base */}
        <RoundedBox args={[3.7, 0.12, 2.45]} radius={0.05} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color={body} metalness={0.75} roughness={0.32} />
        </RoundedBox>
        <mesh position={[0, 0.062, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 1.35]} />
          <meshStandardMaterial color={light ? "#cfd2de" : "#16171c"} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.062, 0.98]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 0.38]} />
          <meshStandardMaterial color={light ? "#d9dbe6" : "#1c1d23"} roughness={0.6} />
        </mesh>

        {/* Lid (pivots on the back edge of the base) */}
        <group ref={lid} position={[0, 0.06, -1.2]}>
          <RoundedBox args={[3.7, LID_H, 0.08]} radius={0.05} smoothness={4} position={[0, LID_H / 2, 0]}>
            <meshStandardMaterial color={body} metalness={0.75} roughness={0.32} />
          </RoundedBox>
          <mesh position={[0, LID_H / 2, 0.041]}>
            <planeGeometry args={[3.62, LID_H - 0.06]} />
            <meshStandardMaterial color={bezel} roughness={0.4} />
          </mesh>
          <group position={[0, LID_H / 2 + 0.02, 0.043]}>
            <ScreenStack textures={laptopTex} width={SCREEN_W} height={SCREEN_H} stage={stage} browse />
          </group>
        </group>

        {/* Phone */}
        <group ref={phone} position={[3.6, 0.95, 1.25]}>
          <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.35}>
            <RoundedBox args={[0.98, 2.02, 0.09]} radius={0.13} smoothness={6}>
              <meshStandardMaterial color={body} metalness={0.8} roughness={0.28} />
            </RoundedBox>
            <mesh position={[0, 0, 0.046]}>
              <planeGeometry args={[0.93, 1.97]} />
              <meshStandardMaterial color={bezel} roughness={0.4} />
            </mesh>
            <group position={[0, 0, 0.048]}>
              <ScreenStack textures={phoneTex} width={PHONE_SCREEN_W} height={PHONE_SCREEN_H} stage={stage} />
            </group>
          </Float>
        </group>

        <ContactShadows position={[0, -0.07, 0.3]} opacity={light ? 0.35 : 0.6} scale={12} blur={2.6} far={4} resolution={256} />
      </group>
    </>
  );
}

/** Warm the texture cache as soon as this module loads. */
export function preloadShowcase(stages: ShowcaseStage[]) {
  useTexture.preload([...stages.map((s) => s.laptop), ...stages.map((s) => s.phone)]);
}
