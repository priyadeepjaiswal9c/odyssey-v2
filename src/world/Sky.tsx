"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SKY, SUN_DIR } from "./layout";
import { rng } from "@/lib/voxel/rng";

/**
 * The golden-hour sky: painterly gradient dome with a low warm sun,
 * faint zenith stars, plus slow-drifting voxel clouds.
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
uniform vec3 uSunDir;
uniform float uTime;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;

  // vertical gradient: horizon → high → zenith
  vec3 col = mix(uHorizon, uHigh, smoothstep(0.02, 0.38, h));
  col = mix(col, uZenith, smoothstep(0.35, 0.85, h));
  // below-horizon: deepen to dusk
  col = mix(col, uZenith * 0.55, smoothstep(0.0, -0.5, h));

  // warm band hugging the horizon
  float band = exp(-abs(h - 0.045) * 11.0);
  col += uGlowBand * band * 0.42;

  // the sun: hot disc + wide soft glow
  float sunDot = max(dot(d, uSunDir), 0.0);
  col += uSunColor * pow(sunDot, 900.0) * 2.2;   // disc
  col += uSunColor * pow(sunDot, 60.0) * 0.4;    // corona
  col += uGlowBand * pow(sunDot, 8.0) * 0.16;    // wide warm wash

  // faint twinkling stars near zenith
  float starMask = smoothstep(0.32, 0.8, h);
  vec2 grid = floor(d.xz / max(0.12, d.y) * 24.0);
  float star = step(0.992, hash21(grid));
  float tw = 0.6 + 0.4 * sin(uTime * 1.5 + hash21(grid + 7.0) * 40.0);
  col += vec3(1.0, 0.95, 0.85) * star * starMask * tw * 0.5;

  // dither to kill banding
  col += (hash21(gl_FragCoord.xy) - 0.5) * 0.012;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function Sky() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color(SKY.zenith) },
      uHigh: { value: new THREE.Color(SKY.high) },
      uHorizon: { value: new THREE.Color(SKY.horizon) },
      uGlowBand: { value: new THREE.Color(SKY.glowBand) },
      uSunColor: { value: new THREE.Color(SKY.sun) },
      uSunDir: { value: SUN_DIR.clone() },
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += dt;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-100}>
      {/* big enough that the camera is always inside it */}
      <icosahedronGeometry args={[520, 3]} />
      <shaderMaterial
        ref={matRef}
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

/** Slow-drifting voxel clouds around the whole world. */
export function Clouds({ count = 26, seed = 77 }: { count?: number; seed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const speeds = useMemo(() => {
    const r = rng(seed);
    const arr: { x: number; y: number; z: number; sx: number; sz: number; v: number }[] = [];
    for (let i = 0; i < count; i++) {
      // clouds spread across the whole map band, above + below islands
      arr.push({
        x: (r() - 0.5) * 600,
        y: 20 + (r() - 0.5) * 90,
        z: (r() - 0.5) * 600,
        sx: 8 + r() * 18,
        sz: 5 + r() * 10,
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
      dummy.scale.set(c.sx, 2.2, c.sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#f6d7c4" transparent opacity={0.5} depthWrite={false} />
    </instancedMesh>
  );
}
