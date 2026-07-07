"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";
import { REALMS } from "../layout";
import { useWorld, type RealmId } from "../store";
import { VoxelMesh } from "../VoxelMesh";
import { buildHubIsland, HUB_SIGNS, HUB_TOP } from "../structures/hub";
import { BUILT_REALMS, REALM_LABELS } from "../registry";
import { FloatingRock } from "./common";
import { Sign } from "../Sign";

/** The Hub — spawn island with the wayshrine and four realm signposts. */
export default function Hub() {
  const pos = REALMS.hub.pos;

  return (
    <group position={[pos[0], pos[1] - HUB_TOP, pos[2]]}>
      <VoxelMesh build={buildHubIsland} castShadow receiveShadow />
      {/* clickable sign hotspots + Monocraft labels */}
      {(Object.entries(HUB_SIGNS) as [Exclude<RealmId, "hub">, (typeof HUB_SIGNS)[keyof typeof HUB_SIGNS]][]).map(
        ([realm, sign]) => (
          <group key={realm}>
            <SignHotspot realm={realm} local={sign.pos} />
            <Sign
              text={REALM_LABELS[realm].toUpperCase()}
              plank={false}
              size={0.6}
              position={[sign.pos[0] - 22, sign.pos[1] + 5.5, sign.pos[2] - 22]}
              rotation={[0, Math.atan2(sign.pos[0] - 22, sign.pos[2] - 22), 0]}
            />
          </group>
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
