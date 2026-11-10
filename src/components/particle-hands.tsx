"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Two hands drawn as point clouds. Points are sampled inside a procedural
 * hand shape (palm, four fingers, thumb, wrist), then gently sway; the
 * cursor pushes nearby particles away and they spring back.
 */

type Capsule = { x: number; y: number; angle: number; len: number; r: number; n: number };

const FINGERS: Capsule[] = [
  { x: -0.36, y: 0.5, angle: 0.12, len: 0.85, r: 0.105, n: 520 },
  { x: -0.12, y: 0.55, angle: 0.03, len: 1.02, r: 0.112, n: 600 },
  { x: 0.13, y: 0.53, angle: -0.04, len: 0.96, r: 0.11, n: 580 },
  { x: 0.37, y: 0.45, angle: -0.14, len: 0.76, r: 0.1, n: 480 },
  // thumb
  { x: 0.48, y: -0.22, angle: -0.95, len: 0.72, r: 0.13, n: 520 },
];

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function sampleHand(): number[] {
  const pts: number[] = [];
  // palm: rounded box with volume
  for (let i = 0; i < 2300; i++) {
    const x = rand(-0.5, 0.5);
    const y = rand(-0.55, 0.58);
    const edge = Math.max(Math.abs(x) / 0.5, Math.abs(y) / 0.58);
    if (edge > 0.97 && Math.random() > 0.5) continue;
    const z = rand(-0.12, 0.12) * Math.sqrt(1 - Math.min(1, edge * edge * 0.6));
    pts.push(x, y, z);
  }
  // wrist
  for (let i = 0; i < 700; i++) {
    const t = Math.random();
    const w = 0.36 - t * 0.04;
    pts.push(rand(-w, w), -0.55 - t * 0.6, rand(-0.1, 0.1));
  }
  // fingers + thumb: capsules
  for (const f of FINGERS) {
    const dir = new THREE.Vector2(Math.sin(f.angle), Math.cos(f.angle));
    const perp = new THREE.Vector2(dir.y, -dir.x);
    for (let i = 0; i < f.n; i++) {
      const t = Math.random() * f.len;
      const tipFall = t > f.len - f.r ? Math.sqrt(1 - ((t - (f.len - f.r)) / f.r) ** 2) : 1;
      const o = rand(-1, 1) * f.r * tipFall;
      const depth = Math.sqrt(Math.max(0, f.r * f.r * tipFall * tipFall - o * o));
      pts.push(f.x + dir.x * t + perp.x * o, f.y + dir.y * t + perp.y * o, rand(-depth, depth));
    }
  }
  return pts;
}

const HANDS = [
  { mirror: -1, x: -0.95, y: -0.1, tilt: 0.28, phase: 0 },
  { mirror: 1, x: 0.95, y: 0.15, tilt: -0.22, phase: 1.7 },
];

function Hands() {
  const ref = useRef<THREE.Points>(null);
  const smoothPointer = useRef(new THREE.Vector2(99, 99));
  const { viewport } = useThree();

  const { home, positions, colors, handIndex, count } = useMemo(() => {
    const homeArr: number[] = [];
    const idx: number[] = [];
    HANDS.forEach((h, hi) => {
      const pts = sampleHand();
      for (let i = 0; i < pts.length; i += 3) {
        homeArr.push(pts[i] * h.mirror, pts[i + 1], pts[i + 2]);
        idx.push(hi);
      }
    });
    const n = idx.length;
    const col = new Float32Array(n * 3);
    const deep = new THREE.Color("#1A1953");
    const blue = new THREE.Color("#2F2FE4");
    const light = new THREE.Color("#8C8CFF");
    for (let i = 0; i < n; i++) {
      const y = homeArr[i * 3 + 1];
      const c = deep.clone().lerp(blue, THREE.MathUtils.clamp((y + 1.1) / 2.4, 0, 1));
      if (Math.random() < 0.08) c.lerp(light, 0.8);
      col.set([c.r, c.g, c.b], i * 3);
    }
    return {
      home: new Float32Array(homeArr),
      positions: new Float32Array(homeArr),
      colors: col,
      handIndex: new Uint8Array(idx),
      count: n,
    };
  }, []);

  useFrame((state) => {
    const p = ref.current;
    if (!p) return;
    const t = state.clock.getElapsedTime();
    const wide = viewport.width > 9;
    const scale = wide ? 1.25 : 0.95;
    const offsetX = wide ? viewport.width * 0.2 : 0;
    const offsetY = wide ? -0.2 : -0.9;

    const target = new THREE.Vector2(
      (state.pointer.x * viewport.width) / 2,
      (state.pointer.y * viewport.height) / 2
    );
    smoothPointer.current.lerp(target, 0.12);
    const px = smoothPointer.current.x;
    const py = smoothPointer.current.y;

    const pos = p.geometry.attributes.position.array as Float32Array;
    const hs = HANDS.map((h) => {
      const rot = h.tilt + Math.sin(t * 0.7 + h.phase) * 0.07;
      return {
        cos: Math.cos(rot),
        sin: Math.sin(rot),
        x: offsetX + h.x * scale,
        y: offsetY + h.y * scale + Math.sin(t * 0.9 + h.phase) * 0.06,
      };
    });

    for (let i = 0; i < count; i++) {
      const h = hs[handIndex[i]];
      const hx = home[i * 3] * scale;
      const hy = home[i * 3 + 1] * scale;
      const hz = home[i * 3 + 2] * scale;
      // rotate in plane, place, add a soft shimmer
      let tx = hx * h.cos - hy * h.sin + h.x;
      let ty = hx * h.sin + hy * h.cos + h.y;
      const tz = hz + Math.sin(t * 1.5 + i * 0.37) * 0.015;

      // cursor repulsion
      const dx = tx - px;
      const dy = ty - py;
      const d2 = dx * dx + dy * dy;
      if (d2 < 0.5) {
        const f = (0.5 - d2) * 0.9;
        const d = Math.sqrt(d2) + 1e-4;
        tx += (dx / d) * f;
        ty += (dy / d) * f;
      }

      // spring toward target
      pos[i * 3] += (tx - pos[i * 3]) * 0.09;
      pos[i * 3 + 1] += (ty - pos[i * 3 + 1]) * 0.09;
      pos[i * 3 + 2] += (tz - pos[i * 3 + 2]) * 0.09;
    }
    p.geometry.attributes.position.needsUpdate = true;
    p.rotation.y = state.pointer.x * 0.18;
    p.rotation.x = -state.pointer.y * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(600 * 3);
    for (let i = 0; i < a.length; i += 3) {
      a[i] = rand(-9, 9);
      a[i + 1] = rand(-5, 5);
      a[i + 2] = rand(-3, 1);
    }
    return a;
  }, []);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = s.clock.getElapsedTime() * 0.01;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#2F2FE4" transparent opacity={0.35} depthWrite={false} />
    </points>
  );
}

export default function ParticleHands() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} aria-hidden>
      <Dust />
      <Hands />
    </Canvas>
  );
}
