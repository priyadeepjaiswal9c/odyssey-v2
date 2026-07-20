"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, SoftShadows } from "@react-three/drei";
import {
  EffectComposer,
  N8AO,
  Bloom,
  GodRays,
  ToneMapping,
  HueSaturation,
  Vignette,
  SMAA,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { Content } from "@/content/types";
import { useWorld } from "./store";
import { buildStops } from "./stops";
import { Sky, SunDisc, Clouds } from "./Sky";
import { Particles } from "./Particles";
import { SKY, SUN_DIR, REALMS } from "./layout";
import { CameraRig, rig } from "./CameraRig";
import { Hud } from "@/ui/Hud";
import Hub from "./realms/Hub";
import ProjectsRealm from "./realms/ProjectsRealm";
import ExperienceRealm from "./realms/ExperienceRealm";
import AchievementsRealm from "./realms/AchievementsRealm";
import AboutRealm from "./realms/AboutRealm";

/** The voxel world: canvas + HUD. Realms mount on demand. */
export default function World({ content }: { content: Content }) {
  const quality = useWorld((s) => s.quality);
  const mounted = useWorld((s) => s.mounted);
  const setStops = useWorld((s) => s.setStops);

  // dev bisect flags: ?noenv / ?nopost
  const noEnv =
    typeof window !== "undefined" && window.location.search.includes("noenv");
  const noPost =
    typeof window !== "undefined" && window.location.search.includes("nopost");

  useEffect(() => {
    setStops(buildStops(content));
  }, [content, setStops]);

  return (
    <>
      <Canvas
        dpr={[1, 1.5]}
        frameloop="always"
        camera={{ position: [52, 30, 60], fov: 45, near: 0.1, far: 900 }}
        shadows={quality !== "low"}
        gl={{
          antialias: quality === "low", // SMAA covers high/medium
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(SKY.fog, 1);
          // tone-mapping is the composer's job on high/medium (ACES as post)
          gl.toneMapping =
            quality === "low"
              ? THREE.ACESFilmicToneMapping
              : THREE.NoToneMapping;
          // context loss: never a silent white canvas
          gl.domElement.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              useWorld.setState({ contextLost: true });
            },
            false
          );
          gl.domElement.addEventListener("webglcontextrestored", () =>
            useWorld.setState({ contextLost: false })
          );
          if (process.env.NODE_ENV !== "production")
            console.log("[kalpana] canvas created");
        }}
      >
        <FrameProbe />
        <PerfGovernor />
        <AnimationDriver />
        {quality !== "low" && <SoftShadows size={20} samples={8} focus={0.6} />}
        {/* exponential fog: depth + hides realm pop-in */}
        <fogExp2 attach="fog" args={[SKY.fog, 0.0042]} />
        <FogRig />
        <Sky />
        <Clouds count={quality === "low" ? 12 : 26} />

        {/* golden-hour light rig (night-aware) */}
        <LightRig />
        <SunLight shadows={quality !== "low"} />
        {/* ambient fireflies around wherever we are */}
        <RealmFireflies quality={quality} />
        {/* warm reflections sampled from our own sky */}
        {!noEnv && (
          <Environment frames={1} resolution={128}>
            <EnvScene />
          </Environment>
        )}

        <CameraRig />

        <Suspense fallback={null}>
          {mounted.includes("hub") && <Hub />}
          {mounted.includes("projects") && <ProjectsRealm content={content} />}
          {mounted.includes("experience") && <ExperienceRealm />}
          {mounted.includes("achievements") && (
            <AchievementsRealm content={content} />
          )}
          {mounted.includes("about") && <AboutRealm content={content} />}
        </Suspense>

        {!noPost && <Post quality={quality} />}
      </Canvas>
      <TourDriver />
      <Hud content={content} />
    </>
  );
}

/**
 * RTX post stack, in the mandated order:
 * N8AO → Bloom → GodRays → DoF → ACES ToneMapping → warm grade → SMAA last.
 * Tiers: high = everything · medium = no DoF/god-rays, halfRes AO · low = none.
 */
function Post({ quality }: { quality: string }) {
  const [sun, setSun] = useState<THREE.Mesh | null>(null);
  if (quality === "low") return <SunDisc ref={setSun} />;

  return (
    <>
      <SunDisc ref={setSun} />
      <EffectComposer
        enableNormalPass
        frameBufferType={THREE.HalfFloatType}
        multisampling={0}
      >
        <N8AO aoRadius={2} intensity={3.5} color="#2a3a55" halfRes />
        <Bloom
          intensity={0.75}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.2}
          mipmapBlur
        />
        {quality === "high" && sun ? (
          <GodRays
            sun={sun}
            samples={30}
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
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        {/* warm golden-hour grade */}
        <HueSaturation saturation={0.12} hue={0.015} />
        <Vignette eskil={false} offset={0.28} darkness={0.55} />
        <SMAA />
      </EffectComposer>
    </>
  );
}

/**
 * frameloop="demand" reconciliation: the world always has live animation
 * (clouds, critters, water shimmer, particles), so this driver invalidates
 * every frame while the world is active — nothing freezes on camera hold,
 * and future selective pausing has a single switch to flip.
 */
function AnimationDriver() {
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    invalidate();
  });
  useEffect(() => {
    invalidate(); // kick the loop on mount
  }, [invalidate]);
  return null;
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

/** watches real FPS and steps quality down if the device is struggling */
function PerfGovernor() {
  const acc = useRef({ t: 0, frames: 0, settled: 0 });

  useFrame((state, dt) => {
    const a = acc.current;
    // give the world a grace period after boot / realm switches
    if (state.clock.elapsedTime < 8) return;
    a.t += dt;
    a.frames++;
    if (a.t >= 4) {
      const fps = a.frames / a.t;
      a.t = 0;
      a.frames = 0;
      const { quality, setQuality } = useWorld.getState();
      if (fps < 42 && a.settled < 2) {
        a.settled++;
        if (quality === "high") setQuality("medium");
        else if (quality === "medium") setQuality("low");
        if (process.env.NODE_ENV !== "production")
          console.log(`[kalpana] fps ${fps.toFixed(0)} → quality stepped down`);
      }
    }
  });
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
        try {
          for (let k = 0; k < n; k++) advance(performance.now() + k * 16, true);
          return `advanced ${n}`;
        } catch (err) {
          return `advance error: ${(err as Error).message}`;
        }
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

/** hemisphere + ambient, dimming into the night */
function LightRig() {
  const hemi = useRef<THREE.HemisphereLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);

  useFrame((_, dt) => {
    const night = useWorld.getState().night;
    if (hemi.current)
      hemi.current.intensity = THREE.MathUtils.damp(
        hemi.current.intensity, night ? 0.16 : 0.5, 1.6, dt
      );
    if (amb.current)
      amb.current.intensity = THREE.MathUtils.damp(
        amb.current.intensity, night ? 0.09 : 0.22, 1.6, dt
      );
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={[SKY.high, SKY.glowBand, 0.5]} />
      <ambientLight ref={amb} intensity={0.22} color="#ffd9a0" />
    </>
  );
}

/** fog eases between warm haze and deep night blue */
function FogRig() {
  const scene = useThree((s) => s.scene);
  const day = useRef(new THREE.Color(SKY.fog));
  const night = useRef(new THREE.Color("#141a28"));
  const mix = useRef(0);

  useFrame((_, dt) => {
    const fog = scene.fog as THREE.Fog | null;
    if (!fog) return;
    mix.current = THREE.MathUtils.damp(
      mix.current, useWorld.getState().night ? 1 : 0, 1.6, dt
    );
    fog.color.lerpColors(day.current, night.current, mix.current);
  });
  return null;
}

/** fireflies follow the current realm (denser + brighter at night) */
function RealmFireflies({ quality }: { quality: string }) {
  const mounted = useWorld((s) => s.mounted);
  const realm = mounted[mounted.length - 1] ?? "hub";
  const center = REALMS[realm].pos;
  if (quality === "low") return null;
  return (
    <Particles
      key={realm}
      center={[center[0], center[1] + 10, center[2]]}
      count={36}
      radius={30}
      color="#ffd98a"
      size={0.8}
      mode="drift"
      seed={realm.length * 17}
      opacity={0.7}
    />
  );
}

/** warm sun that keeps its shadow frustum centered on wherever we are */
function SunLight({ shadows }: { shadows: boolean }) {
  const ref = useRef<THREE.DirectionalLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const sunWarm = useRef(new THREE.Color("#ffc182"));
  const moonCool = useRef(new THREE.Color("#9fb6e0"));

  useFrame((_, dt) => {
    const light = ref.current;
    const target = targetRef.current;
    if (!light || !target) return;
    target.position.copy(rig.target);
    light.position.copy(rig.target).addScaledVector(SUN_DIR, 140);
    light.target = target;
    // the sun rests + cools to moonlight at night
    const isNight = useWorld.getState().night;
    light.intensity = THREE.MathUtils.damp(
      light.intensity, isNight ? 0.55 : 2.4, 1.6, dt
    );
    light.color.lerp(isNight ? moonCool.current : sunWarm.current, 1 - Math.exp(-1.6 * dt));
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
