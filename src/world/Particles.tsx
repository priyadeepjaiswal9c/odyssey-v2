"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { rng } from "@/lib/voxel/rng";
import { getHaloTexture } from "./VoxelMesh";

/**
 * Cheap CPU particles on a Points cloud — three flavors:
 *  drift — fireflies wandering a sphere of air
 *  rise  — embers climbing from a source (forge)
 *  puff  — smoke drifting up and fading (chimney)
 */

export interface ParticlesProps {
  center: [number, number, number];
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
  mode?: "drift" | "rise" | "puff";
  seed?: number;
  opacity?: number;
}

export function Particles({
  center,
  count = 40,
  radius = 26,
  color = "#ffd98a",
  size = 0.9,
  mode = "drift",
  seed = 7,
  opacity = 0.75,
}: ParticlesProps) {
  const points = useRef<THREE.Points>(null);

  const { positions, meta } = useMemo(() => {
    const r = rng(seed);
    const positions = new Float32Array(count * 3);
    const meta = new Float32Array(count * 4); // phase, speed, drift, life
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const rad = mode === "drift" ? Math.sqrt(r()) * radius : r() * 1.6;
      positions[i * 3] = Math.cos(a) * rad;
      positions[i * 3 + 1] =
        mode === "drift" ? (r() - 0.35) * radius * 0.5 : r() * radius;
      positions[i * 3 + 2] = Math.sin(a) * rad;
      meta[i * 4] = r() * Math.PI * 2;
      meta[i * 4 + 1] = 0.4 + r() * 0.9;
      meta[i * 4 + 2] = (r() - 0.5) * 2;
      meta[i * 4 + 3] = r(); // life offset
    }
    return { positions, meta };
  }, [count, radius, mode, seed]);

  useFrame((state) => {
    const pts = points.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const ph = meta[i * 4];
      const sp = meta[i * 4 + 1];
      const dr = meta[i * 4 + 2];
      if (mode === "drift") {
        // lazy figure-eights
        arr[i * 3] += Math.sin(t * 0.3 * sp + ph) * 0.012;
        arr[i * 3 + 1] += Math.cos(t * 0.4 * sp + ph * 2) * 0.008;
        arr[i * 3 + 2] += Math.cos(t * 0.25 * sp + ph) * 0.012;
      } else {
        // rise / puff: climb, wobble, recycle
        const life = ((t * sp * (mode === "puff" ? 0.4 : 1.1)) + meta[i * 4 + 3] * radius) % radius;
        arr[i * 3] = Math.sin(ph + life * 0.4) * (0.5 + life * 0.12) * (mode === "puff" ? 1.4 : 0.7) + dr * 0.4;
        arr[i * 3 + 1] = life;
        arr[i * 3 + 2] = Math.cos(ph + life * 0.3) * (0.4 + life * 0.1) * (mode === "puff" ? 1.4 : 0.7);
      }
    }
    attr.needsUpdate = true;

    // gentle group shimmer
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = opacity * (0.75 + Math.sin(t * 1.7) * 0.25);
  });

  return (
    <points ref={points} position={center} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={getHaloTexture()}
        color={color}
        size={size}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
