"use client";

import { REALMS } from "../layout";
import { VoxelMesh } from "../VoxelMesh";
import { Particles } from "../Particles";
import { buildExperienceIsland, EXP_TOP } from "../structures/experience";
import { FloatingRock } from "./common";
import { Sign } from "../Sign";

/**
 * The Experience quarter — a shop for each chapter of the journey:
 * Windflow (work), IIT Patna, and the extracurriculars (TEDx, Yavanika, NSS).
 * Each shop is signed; no villagers.
 */
export default function ExperienceRealm() {
  const base = REALMS.experience.pos;
  const pos: [number, number, number] = [base[0], base[1] - EXP_TOP, base[2]];

  return (
    <group>
      <group position={pos}>
        <VoxelMesh build={buildExperienceIsland} maxHalos={12} />
        {/* forge embers rising from the chimney */}
        <Particles
          center={[26 - 40, EXP_TOP + 13, 26 - 40]}
          count={14}
          radius={7}
          color="#ff9e3d"
          size={0.5}
          mode="rise"
          seed={11}
          opacity={0.8}
        />
        {/* one clean realm title — per-item detail lives in the showcase card */}
        <Sign text="THE GUILDS" sub="Experience" position={[0, EXP_TOP + 16, 4]} size={1.4} />
      </group>
      <FloatingRock position={[base[0] - 46, base[1] + 14, base[2] + 20]} seed={301} size={4} />
      <FloatingRock position={[base[0] + 42, base[1] - 6, base[2] - 30]} seed={302} size={5} />
    </group>
  );
}

