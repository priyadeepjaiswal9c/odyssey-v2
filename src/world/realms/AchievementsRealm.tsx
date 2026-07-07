"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import type { Content } from "@/content/types";
import { REALMS } from "../layout";
import { VoxelMesh } from "../VoxelMesh";
import { Sign } from "../Sign";
import {
  buildAchievementsIsland,
  plinthPositions,
  ACH_TOP,
} from "../structures/achievements";
import { FloatingRock } from "./common";
import { useWorld } from "../store";

/**
 * The Monument Hall — beacon beams, engraved plinths with Monocraft
 * nameplates (data-driven from the résumé), and a reflective floor.
 */
export default function AchievementsRealm({ content }: { content: Content }) {
  const base = REALMS.achievements.pos;
  const n = content.awards.length;
  const quality = useWorld((s) => s.quality);
  const plinths = useMemo(() => plinthPositions(n), [n]);

  return (
    <group>
      <group position={[base[0], base[1] - ACH_TOP, base[2]]}>
        <VoxelMesh build={() => buildAchievementsIsland(n)} deps={[n]} maxHalos={12} />

        {/* hall banner */}
        <Sign
          text="MONUMENT HALL"
          sub="Achievements"
          position={[0, ACH_TOP + 14, -13]}
          rotation={[0, 0, 0]}
          size={1.3}
          posts
        />

        {/* reflective polished floor (planar mirror over the marble disc) */}
        {quality !== "low" && (
          <mesh
            position={[0, ACH_TOP + 1.06, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[13.4, 48]} />
            <MeshReflectorMaterial
              blur={[240, 60]}
              resolution={quality === "high" ? 512 : 256}
              mixBlur={0.9}
              mixStrength={0.5}
              roughness={0.6}
              depthScale={0.6}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.2}
              color="#cfc0a6"
              metalness={0.1}
              mirror={0.45}
              transparent
              opacity={0.72}
            />
          </mesh>
        )}

        {/* per-award: beacon beam + nameplate */}
        {plinths.map((p, i) => {
          const award = content.awards[i];
          if (!award) return null;
          const x = p[0] - 30;
          const z = p[2] - 30;
          return (
            <group key={award.title} position={[x, ACH_TOP, z]}>
              <BeaconBeam />
              <Sign
                text={shortTitle(award.title)}
                position={[0, 2.1, 1.4]}
                rotation={[0, 0, 0]}
                size={0.62}
                plank={false}
                color="#ffe9c4"
              />
            </group>
          );
        })}
      </group>
      <FloatingRock position={[base[0] - 36, base[1] + 10, base[2] + 24]} seed={401} size={4} />
      <FloatingRock position={[base[0] + 38, base[1] - 4, base[2] - 20]} seed={402} size={3} />
    </group>
  );
}

function shortTitle(t: string): string {
  return t.length > 26 ? t.slice(0, 24).trimEnd() + "…" : t;
}

/** a warm volumetric-ish beacon: additive gradient column, gently breathing */
function BeaconBeam() {
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 128, 0, 0);
    g.addColorStop(0, "rgba(255,206,120,0.55)");
    g.addColorStop(0.5, "rgba(255,184,77,0.22)");
    g.addColorStop(1, "rgba(255,184,77,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state) => {
    if (mat.current)
      mat.current.opacity =
        0.75 + Math.sin(state.clock.elapsedTime * 1.3) * 0.2;
  });

  return (
    <mesh position={[0, 6 + 11, 0]}>
      <cylinderGeometry args={[0.55, 0.95, 22, 12, 1, true]} />
      <meshBasicMaterial
        ref={mat}
        map={tex}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}
