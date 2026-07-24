"use client";

import { useState } from "react";
import type { Content } from "@/content/types";
import { audio } from "@/lib/audio";
import { REALMS } from "../layout";
import { useWorld, type RealmId } from "../store";
import { VoxelMesh } from "../VoxelMesh";
import { buildHubIsland, HUB_SIGNS, HUB_TOP } from "../structures/hub";
import { BUILT_REALMS } from "../registry";
import { FloatingRock } from "./common";
import { Sign } from "../Sign";

/** The Hub — the home island: a glowing wayshrine crowned with the name. */
export default function Hub({ content }: { content: Content }) {
  const pos = REALMS.hub.pos;

  return (
    <group position={[pos[0], pos[1] - HUB_TOP, pos[2]]}>
      <VoxelMesh build={buildHubIsland} castShadow receiveShadow />
      {/* the home's identity — floats over the beacon, greets on arrival */}
      <Sign
        text={content.basics.name}
        sub="AI Engineer · Portfolio"
        position={[0, HUB_TOP + 19, 0]}
        size={1.5}
      />
      {/* clickable hotspots to jump into each realm (top-bar nav labels them) */}
      {(Object.entries(HUB_SIGNS) as [Exclude<RealmId, "hub">, (typeof HUB_SIGNS)[keyof typeof HUB_SIGNS]][]).map(
        ([realm, sign]) => (
          <SignHotspot key={realm} realm={realm} local={sign.pos} />
        )
      )}
      {/* the beacon chimes when tickled (easter egg) */}
      <mesh
        position={[0, HUB_TOP + 4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          audio.chime();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
        visible={false}
      >
        <boxGeometry args={[2.5, 6, 2.5]} />
      </mesh>
      {/* companion rocks floating nearby */}
      <FloatingRock position={[-30, 4, -14]} seed={101} size={4} />
      <FloatingRock position={[26, -7, 18]} seed={102} size={5} />
      <FloatingRock position={[14, 12, -26]} seed={103} size={3} />
    </group>
  );
}

function SignHotspot({
  realm,
  local,
}: {
  realm: Exclude<RealmId, "hub">;
  local: [number, number, number];
}) {
  const goToRealm = useWorld((s) => s.goToRealm);
  const [hover, setHover] = useState(false);
  const built = (BUILT_REALMS as readonly string[]).includes(realm);

  // model is 44 wide, anchored bottom-centered → local x/z shift by -22
  const x = local[0] - 22;
  const z = local[2] - 22;
  const y = local[1];

  if (!built) return null; // silent world: unbuilt signs are decoration

  return (
    <mesh
      position={[x, y + 2, z]}
      onClick={(e) => {
        e.stopPropagation();
        audio.click();
        goToRealm(realm);
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
      <boxGeometry args={[4, 7, 4]} />
      <meshBasicMaterial
        transparent
        opacity={hover ? 0.14 : 0}
        color="#ffd98a"
        depthWrite={false}
      />
    </mesh>
  );
}
