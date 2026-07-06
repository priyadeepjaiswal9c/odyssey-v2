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
import {
  buildTarkIsland,
  buildOwlBody,
  buildOwlHead,
  TARK_TOP,
  TARK_POI,
} from "../structures/tark";
import {
  buildCabIsland,
  buildCart,
  CAB_TOP,
  CAB_TRACK,
} from "../structures/campuscab";
import { FloatingRock } from "./common";

/**
 * The Projects archipelago — three bespoke islands:
 * Meridian (control tower + power grid) · TARK (marble courthouse-library) ·
 * Campus Cab (transit hub with a live rail loop). Silent critters included.
 */
export default function ProjectsRealm({ resume }: { resume: Resume }) {
  const base = REALMS.projects.pos;
  const has = (slug: string) => resume.projects.some((p) => p.slug === slug);

  return (
    <group>
      {has("meridian") && <MeridianIsland base={base} />}
      {has("tark") && <TarkIsland base={base} />}
      {has("campuscab") && <CabIsland base={base} />}
      {/* ambient satellite rocks — kept out of every stop's camera corridor */}
      <FloatingRock position={[base[0] - 44, base[1] + 12, base[2] + 26]} seed={201} size={4} />
      <FloatingRock position={[base[0] + 40, base[1] - 8, base[2] - 34]} seed={202} size={5} />
      <FloatingRock position={[base[0] - 26, base[1] + 18, base[2] - 42]} seed={203} size={3} />
    </group>
  );
}

function islandPos(
  base: [number, number, number],
  slug: string,
  top: number
): [number, number, number] {
  const off = PROJECT_ISLAND_OFFSETS[slug];
  return [base[0] + off[0], base[1] + off[1] - top, base[2] + off[2]];
}

// ————— Meridian —————

function MeridianIsland({ base }: { base: [number, number, number] }) {
  return (
    <group position={islandPos(base, "meridian", MERIDIAN_TOP)}>
      <VoxelMesh build={buildMeridianIsland} maxHalos={10} />
      <MapFox />
    </group>
  );
}

/** the silent fox on its crate — tail wags, body breathes */
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
      const s = 1 + Math.sin(t * 1.4) * 0.02;
      body.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[px - 32, py, pz - 32]} rotation={[0, -0.7, 0]}>
      <group ref={body}>
        <VoxelMesh build={buildFox} anchor="bottom" castShadow={false} />
      </group>
      <group ref={tail} position={[-3.2, 0.5, 0]}>
        <VoxelMesh build={buildFoxTail} anchor="origin" position={[-3.5, 0, -1]} castShadow={false} />
      </group>
    </group>
  );
}

// ————— TARK —————

function TarkIsland({ base }: { base: [number, number, number] }) {
  return (
    <group position={islandPos(base, "tark", TARK_TOP)}>
      <VoxelMesh build={buildTarkIsland} maxHalos={10} />
      <OwlScribe />
    </group>
  );
}

/** the owl-scribe — head swivels, occasionally very interested in you */
function OwlScribe() {
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const [px, py, pz] = TARK_POI.owlPerch;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (head.current) {
      // slow scan + curious tilt; the odd quick double-take
      const scan = Math.sin(t * 0.5) * 0.8 + Math.sin(t * 0.13) * 0.4;
      head.current.rotation.y = scan;
      head.current.rotation.z = Math.sin(t * 0.23) * 0.12;
    }
    if (body.current) {
      const s = 1 + Math.sin(t * 1.1) * 0.02;
      body.current.scale.set(s, 1 + Math.sin(t * 1.1) * 0.03, s);
    }
  });

  return (
    <group position={[px - 32, py, pz - 32]} rotation={[0, 0.5, 0]} scale={0.8}>
      <group ref={body}>
        <VoxelMesh build={buildOwlBody} anchor="bottom" castShadow={false} />
      </group>
      <group ref={head} position={[0, 4.2, 0]}>
        <VoxelMesh build={buildOwlHead} anchor="center" castShadow={false} />
      </group>
    </group>
  );
}

// ————— Campus Cab —————

function CabIsland({ base }: { base: [number, number, number] }) {
  return (
    <group position={islandPos(base, "campuscab", CAB_TOP)}>
      <VoxelMesh build={buildCabIsland} maxHalos={10} />
      <CartCritter />
    </group>
  );
}

/** the cart-critter — forever commuting around the island loop */
function CartCritter() {
  const group = useRef<THREE.Group>(null);
  const [cx, cy, cz] = CAB_TRACK.center;
  const r = CAB_TRACK.radius;

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime * 0.32; // gentle commuter pace
    const a = t % (Math.PI * 2);
    g.position.set(
      cx - 32 + Math.cos(a) * r,
      cy + 0.6 + Math.sin(state.clock.elapsedTime * 5) * 0.06, // rail clatter
      cz - 32 + Math.sin(a) * r
    );
    g.rotation.y = -(a + Math.PI / 2);
    g.rotation.z = Math.sin(state.clock.elapsedTime * 5.3) * 0.02;
  });

  return (
    <group ref={group}>
      <VoxelMesh build={buildCart} anchor="center" scale={0.9} castShadow={false} />
    </group>
  );
}
