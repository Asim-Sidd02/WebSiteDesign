"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COLS = 90;
const ROWS = 60;
const SPACING = 0.16;

function Field() {
  const points = useRef<THREE.Points>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(COLS * ROWS * 3);
    const col = new Float32Array(COLS * ROWS * 3);
    const blue = new THREE.Color("#2F2FE4");
    const ink = new THREE.Color("#1A1953");
    let i = 0;
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        pos[i * 3] = (x - COLS / 2) * SPACING;
        pos[i * 3 + 1] = (y - ROWS / 2) * SPACING;
        pos[i * 3 + 2] = 0;
        const c = ink.clone().lerp(blue, x / COLS);
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
        i++;
      }
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = points.current;
    if (!p) return;
    // ease pointer for a calm, hand-like motion
    pointer.current.lerp(
      new THREE.Vector2(
        (state.pointer.x * viewport.width) / 2,
        (state.pointer.y * viewport.height) / 2
      ),
      0.05
    );
    const arr = p.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COLS * ROWS; i++) {
      const x = arr[i * 3];
      const y = arr[i * 3 + 1];
      const dx = x - pointer.current.x;
      const dy = y - pointer.current.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const ripple = Math.exp(-d * 0.9) * Math.sin(d * 3 - t * 3) * 0.6;
      arr[i * 3 + 2] = Math.sin(x * 0.6 + t * 0.6) * Math.cos(y * 0.5 + t * 0.4) * 0.35 + ripple;
    }
    p.geometry.attributes.position.needsUpdate = true;
    p.rotation.x = -0.55 + state.pointer.y * 0.05;
    p.rotation.z = 0.12 + state.pointer.x * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

export default function SignField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <Field />
    </Canvas>
  );
}
