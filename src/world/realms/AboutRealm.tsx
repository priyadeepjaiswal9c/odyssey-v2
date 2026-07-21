"use client";

import type { Content } from "@/content/types";
import { REALMS } from "../layout";
import { VoxelMesh } from "../VoxelMesh";
import { Particles } from "../Particles";
import { buildAboutIsland, ABOUT_TOP } from "../structures/about";
import { FloatingRock } from "./common";
import { Sign } from "../Sign";

/** The About island — home base. */
export default function AboutRealm(_props: { content: Content }) {
  const base = REALMS.about.pos;

  return (
    <group>
      <group position={[base[0], base[1] - ABOUT_TOP, base[2]]}>
        <VoxelMesh build={buildAboutIsland} maxHalos={10} />
        {/* soft smoke from the cottage chimney */}
        <Particles
          center={[29.5 - 26, ABOUT_TOP + 12, 21.5 - 26]}
          count={10}
          radius={9}
          color="#c9bfb4"
          size={1.1}
          mode="puff"
          seed={21}
          opacity={0.35}
        />
        {/* one clean realm title — contact links live in the top bar + card */}
        <Sign
          text="HOME"
          sub="About · Contact"
          position={[0, ABOUT_TOP + 18, 6]}
          size={1.4}
        />
      </group>
      <FloatingRock position={[base[0] - 34, base[1] + 8, base[2] - 22]} seed={501} size={4} />
      <FloatingRock position={[base[0] + 32, base[1] + 16, base[2] + 26]} seed={502} size={3} />
    </group>
  );
}

