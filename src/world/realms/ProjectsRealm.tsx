"use client";

import type { Content } from "@/content/types";
import { REALMS, PROJECT_ISLAND_OFFSETS } from "../layout";
import { VoxelMesh } from "../VoxelMesh";
import { buildMeridianIsland, MERIDIAN_TOP } from "../structures/meridian";
import { buildTarkIsland, TARK_TOP } from "../structures/tark";
import { buildCabIsland, CAB_TOP } from "../structures/campuscab";
import { FloatingRock } from "./common";
import { Sign } from "../Sign";

/**
 * The Projects archipelago — three bespoke islands:
 * Meridian (control tower + power grid) · TARK (marble courthouse-library) ·
 * Campus Cab (transit hub with a live rail loop). Silent critters included.
 */
export default function ProjectsRealm({ content }: { content: Content }) {
  const base = REALMS.projects.pos;
  const has = (slug: string) => content.projects.some((p) => p.slug === slug);

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
  // approach + showcase cameras live toward +x/+z — signs face that way
  const face: [number, number, number] = [0, Math.PI * 0.22, 0];
  return (
    <group position={islandPos(base, "meridian", MERIDIAN_TOP)}>
      <VoxelMesh build={buildMeridianIsland} maxHalos={10} />
      {/* one grounded banner at the front rim */}
      <Sign
        text="MERIDIAN"
        sub="Energy Supply-Chain AI"
        position={[-9, MERIDIAN_TOP + 5.6, 13]}
        rotation={face}
        size={1.15}
        postHeight={5.6}
      />
    </group>
  );
}

// ————— TARK —————

function TarkIsland({ base }: { base: [number, number, number] }) {
  const face: [number, number, number] = [0, Math.PI * 0.22, 0];
  return (
    <group position={islandPos(base, "tark", TARK_TOP)}>
      <VoxelMesh build={buildTarkIsland} maxHalos={10} />
      <Sign
        text="TARK"
        sub="Legal AI"
        position={[-10, TARK_TOP + 5.6, 13]}
        rotation={face}
        size={1.15}
        postHeight={5.6}
      />
    </group>
  );
}

// ————— Campus Cab —————

function CabIsland({ base }: { base: [number, number, number] }) {
  const face: [number, number, number] = [0, Math.PI * 0.22, 0];
  return (
    <group position={islandPos(base, "campuscab", CAB_TOP)}>
      <VoxelMesh build={buildCabIsland} maxHalos={10} />
      <Sign
        text="CAMPUS CAB"
        sub="Campus Rides"
        position={[-12, CAB_TOP + 5.6, 11]}
        rotation={face}
        size={1.1}
        postHeight={5.6}
      />
    </group>
  );
}

