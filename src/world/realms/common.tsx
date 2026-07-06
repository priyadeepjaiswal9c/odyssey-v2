"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { VoxelModel } from "@/lib/voxel/model";
import { island } from "@/lib/voxel/kit";
import { rng } from "@/lib/voxel/rng";
import { VoxelMesh } from "../VoxelMesh";

/** A small bobbing rock-island — scattered around realms for depth. */
export function FloatingRock({
  position,
  seed,
  size = 5,
}: {
  position: [number, number, number];
  seed: number;
  size?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const phase = useMemo(() => rng(seed)() * Math.PI * 2, [seed]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.y = position[1] + Math.sin(t * 0.35 + phase) * 1.1;
    g.rotation.y = Math.sin(t * 0.08 + phase) * 0.08;
  });

  const dim = size * 2 + 6;
  return (
    <group ref={group} position={position}>
      <VoxelMesh
        build={() => {
          const m = new VoxelModel(dim, size + 10, dim);
          island(m, dim / 2, dim / 2, {
            topY: size + 6,
            rx: size,
            rz: size * 0.85,
            seed,
            depth: size + 2,
          });
          return m;
        }}
        deps={[seed, size]}
        position={[0, -(size + 6), 0]}
      />
    </group>
  );
}
