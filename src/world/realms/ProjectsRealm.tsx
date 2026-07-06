"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Resume } from "@/content/types";
import { REALMS, PROJECT_ISLAND_OFFSETS } from "../layout";
import { VoxelMesh } from "../VoxelMesh";
import {
  buildMeridianIsland,
  buildFox,
  buildFoxTail,
  MERIDIAN_TOP,
  MERIDIAN_POI,
} from "../structures/meridian";
import { FloatingRock } from "./common";

/**
 * The Projects archipelago. P1: Meridian.
 * Islands register here as their structures get built (P2 adds the rest).
 */
export default function ProjectsRealm({ resume }: { resume: Resume }) {
  const base = REALMS.projects.pos;
  const has = (slug: string) => resume.projects.some((p) => p.slug === slug);

  return (
    <group>
      {has("meridian") && <MeridianIsland base={base} />}
      {/* ambient satellite rocks for the whole archipelago */}
      <FloatingRock position={[base[0] - 34, base[1] + 10, base[2] + 22]} seed={201} size={4} />
      <FloatingRock position={[base[0] + 38, base[1] - 6, base[2] - 8]} seed={202} size={5} />
      <FloatingRock position={[base[0] + 20, base[1] + 16, base[2] + 34]} seed={203} size={3} />
    </group>
  );
}

function MeridianIsland({ base }: { base: [number, number, number] }) {
  const off = PROJECT_ISLAND_OFFSETS.meridian;
  const pos: [number, number, number] = [
    base[0] + off[0],
    base[1] + off[1] - MERIDIAN_TOP,
    base[2] + off[2],
  ];

  return (
    <group position={pos}>
      <VoxelMesh build={buildMeridianIsland} castShadow receiveShadow maxHalos={10} />
      <MapFox />
    </group>
  );
}

/** the map-fox, curled beside the map table — tail wags, ears listen */
function MapFox() {
  const tail = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const [px, py, pz] = MERIDIAN_POI.foxPerch;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (tail.current) {
      tail.current.rotation.y = Math.sin(t * 2.6) * 0.45;
      tail.current.rotation.z = Math.sin(t * 1.9) * 0.12;
    }
    if (body.current) {
      // breathing
      const s = 1 + Math.sin(t * 1.4) * 0.02;
      body.current.scale.set(s, s, s);
    }
  });

  // island model is 64 wide, anchor bottom → local shift by -32
  return (
    <group position={[px - 32, py, pz - 32]} rotation={[0, -0.7, 0]}>
      <group ref={body}>
        <VoxelMesh build={buildFox} anchor="bottom" />
      </group>
      <group ref={tail} position={[-3.2, 0.5, 0]}>
        <VoxelMesh build={buildFoxTail} anchor="origin" position={[-3.5, 0, -1]} />
      </group>
    </group>
  );
}
