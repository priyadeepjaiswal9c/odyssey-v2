"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  GodRays,
  Vignette,
} from "@react-three/postprocessing";
import type { Resume } from "@/content/types";
import { useWorld } from "./store";
import { buildStops } from "./stops";
import { Sky, SunDisc, Clouds } from "./Sky";
import { SKY, SUN_DIR } from "./layout";
import { CameraRig, rig } from "./CameraRig";
import { Kip } from "./Kip";
import { Hud } from "@/ui/Hud";
import Hub from "./realms/Hub";
import ProjectsRealm from "./realms/ProjectsRealm";
import ExperienceRealm from "./realms/ExperienceRealm";
import AchievementsRealm from "./realms/AchievementsRealm";
import AboutRealm from "./realms/AboutRealm";

/** The voxel world: canvas + HUD. Realms mount on demand. */
export default function World({ resume }: { resume: Resume }) {
  const quality = useWorld((s) => s.quality);
  const mounted = useWorld((s) => s.mounted);
  const setStops = useWorld((s) => s.setStops);

  // dev bisect flags: ?noenv / ?nopost
  const noEnv =
    typeof window !== "undefined" && window.location.search.includes("noenv");
  const noPost =
    typeof window !== "undefined" && window.location.search.includes("nopost");

  useEffect(() => {
    setStops(buildStops(resume));
  }, [resume, setStops]);

  return (
    <>
      <Canvas
        dpr={quality === "high" ? [1, 2] : quality === "medium" ? [1, 1.5] : 1}
        camera={{ position: [52, 30, 60], fov: 45, near: 0.1, far: 900 }}
        shadows={quality !== "low" ? "soft" : false}
        gl={{
          antialias: quality === "low", // composer MSAA covers high/medium
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(SKY.fog, 1);
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          if (process.env.NODE_ENV !== "production")
            console.log("[kalpana] canvas created");
        }}
      >
        <FrameProbe />
        <fog attach="fog" args={[SKY.fog, 100, 340]} />
        <Sky />
        <Clouds count={quality === "low" ? 12 : 26} />

        {/* golden-hour light rig */}
        <hemisphereLight args={[SKY.high, SKY.glowBand, 0.5]} />
        <ambientLight intensity={0.22} color="#ffd9a0" />
        <SunLight shadows={quality !== "low"} />
        {/* warm reflections sampled from our own sky */}
        {!noEnv && (
          <Environment frames={1} resolution={128}>
            <EnvScene />
          </Environment>
        )}

        <CameraRig />
        <Kip />

        <Suspense fallback={null}>
          {mounted.includes("hub") && <Hub />}
          {mounted.includes("projects") && <ProjectsRealm resume={resume} />}
          {mounted.includes("experience") && <ExperienceRealm />}
          {mounted.includes("achievements") && (
            <AchievementsRealm resume={resume} />
          )}
          {mounted.includes("about") && <AboutRealm resume={resume} />}
        </Suspense>

        {!noPost && <Post quality={quality} />}
      </Canvas>
      <TourDriver />
      <Hud resume={resume} />
    </>
  );
}

/** postprocessing by tier: god-rays + bloom + vignette (high), bloom (medium) */
function Post({ quality }: { quality: string }) {
  const [sun, setSun] = useState<THREE.Mesh | null>(null);

  if (quality === "low") return <SunDisc ref={setSun} />;

  return (
    <>
      <SunDisc ref={setSun} />
      <EffectComposer multisampling={quality === "high" ? 4 : 2}>
        <Bloom
          intensity={0.65}
          luminanceThreshold={1.05}
          luminanceSmoothing={0.2}
          mipmapBlur
        />
        {quality === "high" && sun ? (
          <GodRays
            sun={sun}
            samples={36}
            density={0.9}
            decay={0.92}
            weight={0.09}
            exposure={0.14}
            clampMax={0.5}
            blur
          />
        ) : (
          <></>
        )}
        <Vignette eskil={false} offset={0.28} darkness={0.55} />
      </EffectComposer>
    </>
  );
}

/** tiny env scene rendered once into PMREM — warm sky + hot sun blob */
function EnvScene() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[100, 24, 24]} />
        <meshBasicMaterial color={SKY.high} side={THREE.BackSide} />
      </mesh>
      <mesh position={SUN_DIR.clone().multiplyScalar(80)}>
        <sphereGeometry args={[18, 16, 16]} />
        <meshBasicMaterial color="#fff0c8" />
      </mesh>
      {/* warm ground bounce */}
      <mesh position={[0, -90, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial color={SKY.glowBand} />
      </mesh>
    </>
  );
}

/** auto-tour pacing: hold at each stop, then advance (no narrator) */
function TourDriver() {
  const touring = useWorld((s) => s.touring);
  const stopIndex = useWorld((s) => s.stopIndex);
  const targetIndex = useWorld((s) => s.targetIndex);
  const stops = useWorld((s) => s.stops);

  useEffect(() => {
    if (!touring || targetIndex !== null) return;
    const stop = stops[stopIndex];
    if (!stop) return;
    const t = setTimeout(() => {
      const st = useWorld.getState();
      if (st.stopIndex >= st.stops.length - 1) st.pauseTour();
      else st.next();
    }, stop.holdMs ?? 3200);
    return () => clearTimeout(t);
  }, [touring, stopIndex, targetIndex, stops]);

  return null;
}

/** dev-only frame counter + teleport hook for headless verification */
function FrameProbe() {
  const advance = useThree((s) => s.advance);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);

  useFrame(() => {
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __frames?: number }).__frames =
        ((window as unknown as { __frames?: number }).__frames ?? 0) + 1;
    }
  });

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as {
      __kalpana?: {
        snap: (i: number) => string;
        enter: () => string;
        render: (n?: number) => string;
        scene: () => string;
        cullOff: () => string;
      };
    };
    w.__kalpana = {
      snap: (i: number) => {
        const s = useWorld.getState();
        const stop = s.stops[i];
        if (!stop) return `no stop ${i} (have ${s.stops.length})`;
        useWorld.setState({
          phase: "world",
          stopIndex: i,
          targetIndex: null,
          touring: false,
          mounted: [stop.realm],
          showcaseSlug: stop.showcase ?? null,
        });
        rig.activeTl?.kill();
        rig.activeTl = null;
        rig.pos.set(...stop.cam);
        rig.target.set(...stop.target);
        rig.flying = false;
        camera.position.copy(rig.pos);
        camera.lookAt(rig.target.x, rig.target.y, rig.target.z);
        return `snapped to ${stop.id}`;
      },
      enter: () => {
        useWorld.setState({ phase: "world" });
        return "entered";
      },
      render: (n = 3) => {
        for (let k = 0; k < n; k++) advance(performance.now() + k * 16, true);
        return `advanced ${n}`;
      },
      scene: () => {
        const out: string[] = [];
        scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh || (o as THREE.Sprite).isSprite) {
            const geo = mesh.geometry as THREE.BufferGeometry | undefined;
            const verts = geo?.attributes?.position?.count ?? 0;
            const bs = geo?.boundingSphere;
            const p = o.getWorldPosition(new THREE.Vector3());
            out.push(
              `${o.type}:${(mesh.material as THREE.Material)?.type ?? "?"} v=${verts} bsR=${bs ? bs.radius.toFixed(1) : "null"} @(${p.x.toFixed(0)},${p.y.toFixed(0)},${p.z.toFixed(0)}) vis=${o.visible} cull=${o.frustumCulled}`
            );
          }
        });
        return out.join("\n");
      },
      cullOff: () => {
        let n = 0;
        scene.traverse((o) => {
          o.frustumCulled = false;
          n++;
        });
        return `culling off for ${n}`;
      },
    };
  }, [advance, camera, scene]);

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
    light.position.copy(rig.target).addScaledVector(SUN_DIR, 140);
    light.target = target;
  });

  return (
    <>
      <directionalLight
        ref={ref}
        color="#ffc182"
        intensity={2.4}
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
        shadow-normalBias={0.6}
      />
      <object3D ref={targetRef} />
    </>
  );
}
