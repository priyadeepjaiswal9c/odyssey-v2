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
        {/* each shop signed on its building's face */}
        <Sign text="WINDFLOW.AI" sub="AI Engineering Intern" position={[-10, EXP_TOP + 7.4, -7.4]} size={1.0} />
        <Sign text="IIT PATNA" sub="B.Tech ECE" position={[13, EXP_TOP + 6.4, -8.4]} size={1.0} />
        <Sign text="TEDx" sub="Speaker · Organizer" position={[-14, EXP_TOP + 8.2, 14.2]} size={1.0} />
        <Sign text="YAVANIKA" sub="Dramatics" position={[1, EXP_TOP + 8.4, 19.6]} size={1.0} />
        <Sign text="NSS" sub="Community Service" position={[16, EXP_TOP + 5.8, 14.6]} size={1.0} />
      </group>
      <FloatingRock position={[base[0] - 46, base[1] + 14, base[2] + 20]} seed={301} size={4} />
      <FloatingRock position={[base[0] + 42, base[1] - 6, base[2] - 30]} seed={302} size={5} />
    </group>
  );
}

