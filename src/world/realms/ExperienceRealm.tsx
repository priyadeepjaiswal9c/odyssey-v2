"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { REALMS } from "../layout";
import { VoxelMesh } from "../VoxelMesh";
import {
  buildExperienceIsland,
  EXP_TOP,
  EXP_POI,
} from "../structures/experience";
import {
  buildVillagerBody,
  buildVillagerHead,
  buildHammerArm,
  buildMicArm,
  type VillagerKind,
} from "../structures/villagers";
import { FloatingRock } from "./common";

/**
 * The Experience village — five profession-villagers at their stations:
 * the Windflow AI-smith (hammering), the IIT Patna librarian (reading),
 * the TEDx orator (mid-talk), the Yavanika bard (performing), and the
 * NSS helper (tending saplings). All silent, all alive.
 */
export default function ExperienceRealm() {
  const base = REALMS.experience.pos;
  const pos: [number, number, number] = [base[0], base[1] - EXP_TOP, base[2]];

  return (
    <group>
      <group position={pos}>
        <VoxelMesh build={buildExperienceIsland} maxHalos={12} />
        <Villager kind="smith" poi={EXP_POI.smith} face={0.9} hammer />
        <Villager kind="librarian" poi={EXP_POI.librarian} face={Math.PI} />
        <Villager kind="orator" poi={EXP_POI.orator} face={Math.PI * 0.9} mic />
        <Villager kind="bard" poi={EXP_POI.bard} face={Math.PI * 1.1} />
        <Villager kind="helper" poi={EXP_POI.helper} face={-0.6} />
      </group>
      <FloatingRock position={[base[0] - 46, base[1] + 14, base[2] + 20]} seed={301} size={4} />
      <FloatingRock position={[base[0] + 42, base[1] - 6, base[2] - 30]} seed={302} size={5} />
    </group>
  );
}

function Villager({
  kind,
  poi,
  face,
  hammer,
  mic,
}: {
  kind: VillagerKind;
  poi: [number, number, number];
  face: number;
  hammer?: boolean;
  mic?: boolean;
}) {
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    if (head.current) {
      // idle: slow nods + curious turns
      head.current.rotation.y = Math.sin(t * 0.6) * 0.35;
      head.current.rotation.x = Math.sin(t * 1.1) * 0.06 + 0.03;
    }
    if (body.current) {
      // breathing sway
      body.current.rotation.z = Math.sin(t * 1.3) * 0.02;
      body.current.scale.y = 1 + Math.sin(t * 1.6) * 0.015;
    }
    if (arm.current) {
      if (hammer) {
        // hammer swing: raise slow, strike quick
        const cycle = (t * 1.4) % (Math.PI * 2);
        const raise = Math.max(0, Math.sin(cycle));
        const strike = Math.pow(Math.max(0, Math.sin(cycle * 2 + 2)), 3);
        arm.current.rotation.x = -1.8 * raise + 1.2 * strike;
      } else if (mic) {
        // mic held up, gesturing
        arm.current.rotation.x = -2.2 + Math.sin(t * 1.8) * 0.15;
        arm.current.rotation.z = Math.sin(t * 0.9) * 0.1;
      }
    }
  });

  // model 80 wide → local shift -40; villagers scaled down to feel small
  const x = poi[0] - 40;
  const z = poi[2] - 40;
  const y = poi[1];

  return (
    <group position={[x, y, z]} rotation={[0, face, 0]} scale={0.55}>
      <group ref={body}>
        <VoxelMesh build={() => buildVillagerBody(kind)} deps={[kind]} anchor="bottom" castShadow={false} />
      </group>
      <group ref={head} position={[0, 9.6, 0]}>
        <VoxelMesh build={() => buildVillagerHead(kind)} deps={[kind]} anchor="center" castShadow={false} />
      </group>
      {(hammer || mic) && (
        <group ref={arm} position={[2.4, 6.4, 0.6]}>
          <VoxelMesh
            build={hammer ? buildHammerArm : buildMicArm}
            deps={[kind]}
            anchor="origin"
            position={[-0.5, -4.6, -0.8]}
            castShadow={false}
          />
        </group>
      )}
    </group>
  );
}
