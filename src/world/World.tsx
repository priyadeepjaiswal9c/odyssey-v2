"use client";

import { Canvas } from "@react-three/fiber";
import type { Resume } from "@/content/types";
import { useWorld } from "./store";

/**
 * The voxel world canvas. P0 stub: warm dusk clear color + fog.
 * P1 fills in: sky dome, hub, Meridian island, Kip, tour rig.
 */
export default function World({ resume }: { resume: Resume }) {
  const quality = useWorld((s) => s.quality);
  void resume; // consumed by realms in P1+

  return (
    <Canvas
      dpr={quality === "high" ? [1, 2] : [1, 1.5]}
      camera={{ position: [0, 14, 34], fov: 45, near: 0.1, far: 400 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#2b1b3d");
        void scene;
      }}
    >
      <fog attach="fog" args={["#2b1b3d", 60, 220]} />
      <ambientLight intensity={0.6} color="#ffd9a0" />
      <directionalLight position={[30, 40, 10]} intensity={1.2} color="#ffbe7d" />
    </Canvas>
  );
}
