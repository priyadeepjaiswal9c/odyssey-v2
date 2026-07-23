"use client";

import { REALMS, EXP_EXTRA_OFFSET } from "../layout";
import { VoxelMesh } from "../VoxelMesh";
import { Particles } from "../Particles";
import { buildExperienceIsland, buildExtraIsland, EXP_TOP } from "../structures/experience";
import { FloatingRock } from "./common";
import { Sign } from "../Sign";

/**
 * The Experience quarter — two islands:
 *  - The Guilds (work · study): Windflow AI-forge + IIT Patna library.
 *  - The Commons (extra-curricular): TEDx stage, Yavanika theatre, NSS post.
 */
export default function ExperienceRealm() {
  const base = REALMS.experience.pos;
  const pos: [number, number, number] = [base[0], base[1] - EXP_TOP, base[2]];
  const extra: [number, number, number] = [
    base[0] + EXP_EXTRA_OFFSET[0],
    base[1] + EXP_EXTRA_OFFSET[1] - EXP_TOP,
    base[2] + EXP_EXTRA_OFFSET[2],
  ];

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
        <Sign text="EXPERIENCE" sub="Work & Study" position={[0, EXP_TOP + 16, 4]} size={1.4} />
      </group>

      {/* — the extra-curricular island, a world of its own — */}
      <group position={extra}>
        <VoxelMesh build={buildExtraIsland} maxHalos={10} />
        <Sign text="EXTRACURRICULAR" sub="Stage & Service" position={[0, EXP_TOP + 19, 12]} size={1.3} />
      </group>

      <FloatingRock position={[base[0] - 40, base[1] + 22, base[2] - 28]} seed={301} size={4} />
      <FloatingRock position={[base[0] + 42, base[1] - 6, base[2] - 30]} seed={302} size={5} />
    </group>
  );
}

