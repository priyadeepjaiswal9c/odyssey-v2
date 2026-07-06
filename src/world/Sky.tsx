"use client";

import { forwardRef, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SKY, SUN_DIR } from "./layout";
import { rng } from "@/lib/voxel/rng";

/**
 * Realistic golden-hour sky: warm amber horizon into dusty-blue zenith,
 * hot sun disc (paired with a physical sun mesh for god-rays), and
 * slow-drifting volumetric-ish clouds. No purple.
 */

const VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_Position.z = gl_Position.w; // pin to far plane
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vDir;
uniform vec3 uZenith;
uniform vec3 uHigh;
uniform vec3 uHorizon;
uniform vec3 uGlowBand;
uniform vec3 uSunColor;
uniform vec3 uBelow;
uniform vec3 uSunDir;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;

  // atmospheric gradient: amber horizon → dusty blue zenith
  vec3 col = mix(uHorizon, uHigh, smoothstep(0.0, 0.34, h));
  col = mix(col, uZenith, smoothstep(0.3, 0.8, h));
  // below-horizon: deep warm earth haze
  col = mix(col, uBelow, smoothstep(-0.02, -0.42, h));

  float sunDot = max(dot(d, uSunDir), 0.0);

  // horizon scattering band, strongest toward the sun azimuth
  float band = exp(-abs(h - 0.03) * 10.0);
  float towardSun = 0.35 + 0.65 * pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(uSunDir.x, 0.0, uSunDir.z))), 0.0), 2.0);
  col += uGlowBand * band * 0.5 * towardSun;

  // the sun: hot disc + tight corona + soft warm wash
  col += uSunColor * pow(sunDot, 1400.0) * 3.0;
  col += uSunColor * pow(sunDot, 80.0) * 0.5;
  col += uGlowBand * pow(sunDot, 10.0) * 0.22;

  // dither to kill banding
  col += (hash21(gl_FragCoord.xy) - 0.5) * 0.012;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function Sky() {
  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color(SKY.zenith) },
      uHigh: { value: new THREE.Color(SKY.high) },
      uHorizon: { value: new THREE.Color(SKY.horizon) },
      uGlowBand: { value: new THREE.Color(SKY.glowBand) },
      uSunColor: { value: new THREE.Color(SKY.sun) },
      uBelow: { value: new THREE.Color(SKY.below) },
      uSunDir: { value: SUN_DIR.clone() },
    }),
    []
  );

  return (
    <mesh frustumCulled={false} renderOrder={-100}>
      <icosahedronGeometry args={[520, 3]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
        fog={false}
      />
    </mesh>
  );
}

/**
 * Physical sun disc — the occludable light source god-rays sample.
 * Sits just inside the sky dome along SUN_DIR.
 */
export const SunDisc = forwardRef<THREE.Mesh>(function SunDisc(_, ref) {
  const pos = useMemo(() => SUN_DIR.clone().multiplyScalar(460), []);
  return (
    <mesh ref={ref} position={pos} frustumCulled={false}>
      <sphereGeometry args={[11, 24, 24]} />
      <meshBasicMaterial color={SKY.sun} toneMapped={false} fog={false} />
    </mesh>
  );
});

/** Slow-drifting soft clouds, warm-lit. */
export function Clouds({ count = 26, seed = 77 }: { count?: number; seed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const speeds = useMemo(() => {
    const r = rng(seed);
    const arr: { x: number; y: number; z: number; sx: number; sz: number; v: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (r() - 0.5) * 600,
        y: 26 + (r() - 0.5) * 100,
        z: (r() - 0.5) * 600,
        sx: 10 + r() * 20,
        sz: 6 + r() * 12,
        v: 0.6 + r() * 1.2,
      });
    }
    return arr;
  }, [count, seed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const mesh = ref.current;
    if (!mesh) return;
    speeds.forEach((c, i) => {
      const x = ((c.x + t * c.v + 300) % 600) - 300;
      dummy.position.set(x, c.y + Math.sin(t * 0.1 + i) * 0.8, c.z);
      dummy.scale.set(c.sx, 2.4, c.sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#f2cfa6" transparent opacity={0.42} depthWrite={false} />
    </instancedMesh>
  );
}
