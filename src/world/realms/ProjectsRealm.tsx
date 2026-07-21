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
 * The Projects archipelago — three bespoke islands (Meridian, TARK, Campus
 * Cab). One clean title sign floats above each island, same language as
 * every other realm; the DOM showcase card carries the detail.
 */
export default function ProjectsRealm({ content }: { content: Content }) {
  const base = REALMS.projects.pos;
  const has = (slug: string) => content.projects.some((p) => p.slug === slug);

  return (
    <group>
      {has("meridian") && (
        <group position={islandPos(base, "meridian", MERIDIAN_TOP)}>
          <VoxelMesh build={buildMeridianIsland} maxHalos={10} />
          <Sign text="MERIDIAN" sub="Energy Supply-Chain AI" position={[0, MERIDIAN_TOP + 30, 0]} size={1.4} />
        </group>
      )}
      {has("tark") && (
        <group position={islandPos(base, "tark", TARK_TOP)}>
          <VoxelMesh build={buildTarkIsland} maxHalos={10} />
          <Sign text="TARK AI" sub="Legal Assistant" position={[-8, TARK_TOP + 22, 0]} size={1.4} />
        </group>
      )}
      {has("campuscab") && (
        <group position={islandPos(base, "campuscab", CAB_TOP)}>
          <VoxelMesh build={buildCabIsland} maxHalos={10} />
          <Sign text="CAMPUS CAB" sub="Ride Pooling" position={[0, CAB_TOP + 19, 0]} size={1.4} />
        </group>
      )}
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
