"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";
import { audio } from "@/lib/audio";
import { VoxelMesh } from "./VoxelMesh";
import { useWorld } from "./store";
import { rig } from "./CameraRig";

/**
 * Kip — a small glowing voxel critter. Flies ahead of the camera, bobs,
 * flaps, spins with excitement on arrival. The thread of charm.
 */

function buildKipBody(): VoxelModel {
  const m = new VoxelModel(7, 8, 7);
  // round body
  m.ellipsoid(3, 3, 3, 2.6, 2.2, 2.6, B.kipCream);
  // golden belly (front = +z)
  m.ellipsoid(3, 2.4, 4.2, 1.6, 1.2, 1.2, B.kipGold);
  // big dark eyes
  m.set(2, 4, 5, B.black);
  m.set(4, 4, 5, B.black);
  // rosy cheeks
  m.set(1, 3, 5, B.leavesCoral);
  m.set(5, 3, 5, B.leavesCoral);
  // antenna with glowing tip
  m.set(3, 6, 3, B.wood);
  m.set(3, 7, 3, B.kipGlow);
  // tiny feet
  m.set(2, 0, 3, B.kipGold);
  m.set(4, 0, 3, B.kipGold);
  return m;
}

function buildWing(): VoxelModel {
  const m = new VoxelModel(3, 1, 4);
  m.fill(0, 0, 0, 2, 0, 2, B.white);
  m.set(2, 0, 3, B.white);
  return m;
}

export function Kip() {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const quality = useWorld((s) => s.quality);
  const spin = useRef({ active: false, t: 0 });
  const wasFlying = useRef(false);
  const idleSince = useRef(0);
  const target = useMemo(() => new THREE.Vector3(4, 10, 8), []);
  const facing = useRef(0);

  // easter egg: anything can ask Kip to celebrate
  useEffect(() => {
    const onCelebrate = () => {
      spin.current = { active: true, t: 0 };
      audio.chirp();
    };
    window.addEventListener("kip:celebrate", onCelebrate);
    return () => window.removeEventListener("kip:celebrate", onCelebrate);
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const s = useWorld.getState();
    const stop = s.stops[s.targetIndex ?? s.stopIndex];
    if (stop) target.set(...stop.kip);

    // arrival celebration: full spin
    if (wasFlying.current && !rig.flying) {
      spin.current = { active: true, t: 0 };
      idleSince.current = state.clock.elapsedTime;
    }
    wasFlying.current = rig.flying;

    // been parked a while? do a little loop for fun
    if (
      !rig.flying &&
      state.clock.elapsedTime - idleSince.current > 14 &&
      !spin.current.active
    ) {
      spin.current = { active: true, t: 0 };
      idleSince.current = state.clock.elapsedTime;
    }

    // fly toward target — faster when leading a flight
    const speed = rig.flying ? 3.2 : 1.8;
    g.position.x = THREE.MathUtils.damp(g.position.x, target.x, speed, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, target.y, speed, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, target.z, speed, dt);

    const t = state.clock.elapsedTime;
    // bob + sway
    if (body.current) {
      body.current.position.y = Math.sin(t * 2.3) * 0.32;
      body.current.rotation.z = Math.sin(t * 1.7) * 0.06;
    }

    // face the camera (mostly), or travel direction when moving fast
    const toCam = Math.atan2(
      state.camera.position.x - g.position.x,
      state.camera.position.z - g.position.z
    );
    facing.current = dampAngle(facing.current, toCam, 3, dt);
    g.rotation.y = facing.current;

    // celebration spin overrides facing
    if (spin.current.active) {
      spin.current.t += dt * 1.8;
      if (spin.current.t >= 1) {
        spin.current.active = false;
      } else {
        g.rotation.y = facing.current + easeOutBack(spin.current.t) * Math.PI * 2;
      }
    }

    // wing flap
    const flap = Math.sin(t * 13) * 0.55 + 0.25;
    if (wingL.current) wingL.current.rotation.z = flap;
    if (wingR.current) wingR.current.rotation.z = -flap;

    // glow pulse
    if (lightRef.current) {
      lightRef.current.intensity = 2.6 + Math.sin(t * 2.1) * 0.5;
    }
  });

  return (
    <group ref={group} position={[4, 12, 8]}>
      {/* clickable — Kip appreciates the attention */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent("kip:celebrate"));
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
        visible={false}
      >
        <sphereGeometry args={[2.4, 8, 8]} />
      </mesh>
      <group ref={body} scale={0.42}>
        <VoxelMesh build={buildKipBody} anchor="center" haloScale={1.6} />
        <group ref={wingL} position={[-2.8, 0.6, -0.5]}>
          <VoxelMesh build={buildWing} anchor="origin" position={[-3, 0, -2]} />
        </group>
        <group ref={wingR} position={[2.8, 0.6, -0.5]} scale={[-1, 1, 1]}>
          <VoxelMesh build={buildWing} anchor="origin" position={[-3, 0, -2]} />
        </group>
      </group>
      {quality !== "low" && (
        <pointLight
          ref={lightRef}
          color="#ffd98a"
          intensity={2.6}
          distance={16}
          decay={1.8}
        />
      )}
    </group>
  );
}

function dampAngle(cur: number, to: number, lambda: number, dt: number): number {
  let diff = to - cur;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return cur + diff * (1 - Math.exp(-lambda * dt));
}

function easeOutBack(t: number): number {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
