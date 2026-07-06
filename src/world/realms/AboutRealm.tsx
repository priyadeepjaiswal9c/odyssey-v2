"use client";

import { useState } from "react";
import type { Resume } from "@/content/types";
import { audio } from "@/lib/audio";
import { REALMS } from "../layout";
import { VoxelMesh } from "../VoxelMesh";
import { Particles } from "../Particles";
import { buildAboutIsland, ABOUT_TOP, ABOUT_POI } from "../structures/about";
import { FloatingRock } from "./common";

/** The About island — home base with clickable social signposts. */
export default function AboutRealm({ resume }: { resume: Resume }) {
  const base = REALMS.about.pos;
  const github = resume.basics.profiles.find((p) => p.network === "GitHub");
  const linkedin = resume.basics.profiles.find((p) => p.network === "LinkedIn");

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
        {github && <SignHotspot local={ABOUT_POI.signGitHub} url={github.url} />}
        {linkedin && <SignHotspot local={ABOUT_POI.signLinkedIn} url={linkedin.url} />}
        <SignHotspot
          local={ABOUT_POI.signEmail}
          url={`mailto:${resume.basics.email}`}
        />
        <SignHotspot
          local={ABOUT_POI.mailbox}
          url={`mailto:${resume.basics.email}`}
        />
      </group>
      <FloatingRock position={[base[0] - 34, base[1] + 8, base[2] - 22]} seed={501} size={4} />
      <FloatingRock position={[base[0] + 32, base[1] + 16, base[2] + 26]} seed={502} size={3} />
    </group>
  );
}

/** invisible click target over a sign — opens the link in a new tab */
function SignHotspot({
  local,
  url,
}: {
  local: [number, number, number];
  url: string;
}) {
  const [hover, setHover] = useState(false);
  // island model is 52 wide, anchored bottom-centered → shift by -26
  const x = local[0] - 26;
  const z = local[2] - 26;
  const y = local[1];

  return (
    <mesh
      position={[x, y + 2.5, z]}
      onClick={(e) => {
        e.stopPropagation();
        audio.click();
        window.open(url, "_blank", "noopener");
      }}
      onPointerOver={() => {
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
    >
      <boxGeometry args={[3.4, 6, 3.4]} />
      <meshBasicMaterial
        transparent
        opacity={hover ? 0.14 : 0}
        color="#ffd98a"
        depthWrite={false}
      />
    </mesh>
  );
}
