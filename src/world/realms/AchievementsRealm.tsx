"use client";

import type { Resume } from "@/content/types";
import { REALMS } from "../layout";
import { VoxelMesh } from "../VoxelMesh";
import { buildAchievementsIsland, ACH_TOP } from "../structures/achievements";
import { FloatingRock } from "./common";

/** The Hall of Achievements — pedestal count driven by the résumé. */
export default function AchievementsRealm({ resume }: { resume: Resume }) {
  const base = REALMS.achievements.pos;
  const n = resume.awards.length;

  return (
    <group>
      <group position={[base[0], base[1] - ACH_TOP, base[2]]}>
        <VoxelMesh build={() => buildAchievementsIsland(n)} deps={[n]} maxHalos={12} />
      </group>
      <FloatingRock position={[base[0] - 36, base[1] + 10, base[2] + 24]} seed={401} size={4} />
      <FloatingRock position={[base[0] + 38, base[1] - 4, base[2] - 20]} seed={402} size={3} />
    </group>
  );
}
