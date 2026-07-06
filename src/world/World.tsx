"use client";

import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Resume } from "@/content/types";
import { useWorld } from "./store";
import { buildStops } from "./stops";
import { Sky, Clouds } from "./Sky";
import { SKY, SUN_DIR } from "./layout";
import { CameraRig, rig } from "./CameraRig";
import { Kip } from "./Kip";
import { Hud } from "@/ui/Hud";
import Hub from "./realms/Hub";
import ProjectsRealm from "./realms/ProjectsRealm";

/** The voxel world: canvas + HUD. Realms mount on demand. */
export default function World({ resume }: { resume: Resume }) {
  const quality = useWorld((s) => s.quality);
  const mounted = useWorld((s) => s.mounted);
  const setStops = useWorld((s) => s.setStops);

  useEffect(() => {
    setStops(buildStops(resume));
  }, [resume, setStops]);

  return (
    <>
      <Canvas
        dpr={quality === "high" ? [1, 2] : quality === "medium" ? [1, 1.5] : 1}
        camera={{ position: [46, 40, 66], fov: 45, near: 0.1, far: 700 }}
        shadows={quality === "high"}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(SKY.fog, 1);
          if (process.env.NODE_ENV !== "production")
            console.log("[kalpana] canvas created");
        }}
      >
        <FrameProbe />
        <fog attach="fog" args={[SKY.fog, 90, 320]} />
        <Sky />
        <Clouds count={quality === "low" ? 12 : 26} />

        {/* golden-hour light rig */}
        <hemisphereLight args={[SKY.high, SKY.glowBand, 0.55]} />
        <ambientLight intensity={0.32} color="#ffd9a0" />
        <SunLight shadows={quality === "high"} />

        <CameraRig />
        <Kip />

        <Suspense fallback={null}>
          {mounted.includes("hub") && <Hub />}
          {mounted.includes("projects") && <ProjectsRealm resume={resume} />}
        </Suspense>
      </Canvas>
      <Hud resume={resume} />
    </>
  );
}

/** dev-only frame counter so headless checks can confirm the loop runs */
function FrameProbe() {
  const advance = useThree((s) => s.advance);
  const camera = useThree((s) => s.camera);

  useFrame(() => {
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __frames?: number }).__frames =
        ((window as unknown as { __frames?: number }).__frames ?? 0) + 1;
    }
  });

  // dev verification hook: teleport to a stop + force renders while the
  // tab is backgrounded (RAF paused). Lets screenshots capture any framing.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as {
      __kalpana?: { snap: (i: number) => string; render: (n?: number) => string };
    };
    w.__kalpana = {
      snap: (i: number) => {
        const s = useWorld.getState();
        const stop = s.stops[i];
        if (!stop) return `no stop ${i} (have ${s.stops.length})`;
        useWorld.setState({
          stopIndex: i,
          targetIndex: null,
          touring: false,
          mounted: [stop.realm],
          dialogue: { text: stop.line, key: stop.id },
          showcaseSlug: stop.showcase ?? null,
        });
        rig.pos.set(...stop.cam);
        rig.target.set(...stop.target);
        rig.flying = false;
        camera.position.copy(rig.pos);
        camera.lookAt(rig.target.x, rig.target.y, rig.target.z);
        return `snapped to ${stop.id}`;
      },
      render: (n = 3) => {
        for (let k = 0; k < n; k++) advance(performance.now() + k * 16, true);
        return `advanced ${n}`;
      },
    };
  }, [advance, camera]);

  return null;
}

/** warm sun that keeps its shadow frustum centered on wherever we are */
function SunLight({ shadows }: { shadows: boolean }) {
  const ref = useRef<THREE.DirectionalLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  useFrame(() => {
    const light = ref.current;
    const target = targetRef.current;
    if (!light || !target) return;
    target.position.copy(rig.target);
    light.position
      .copy(rig.target)
      .addScaledVector(SUN_DIR, 140);
    light.target = target;
  });

  return (
    <>
      <directionalLight
        ref={ref}
        color="#ffbe7d"
        intensity={1.6}
        castShadow={shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-near={40}
        shadow-camera-far={280}
        shadow-bias={-0.0004}
      />
      <object3D ref={targetRef} />
    </>
  );
}
