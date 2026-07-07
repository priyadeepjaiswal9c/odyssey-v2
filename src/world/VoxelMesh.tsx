"use client";

import { useMemo, useEffect } from "react";
import * as THREE from "three";
import { meshVoxels, type MeshResult, type MeshBuffers } from "@/lib/voxel/mesh";
import type { MatClass } from "@/lib/voxel/palette";
import type { VoxelModel } from "@/lib/voxel/model";
import { useWorld } from "./store";

/**
 * Renders a VoxelModel through the RTX pipeline: one mesh per material
 * class, sharing module-level PBR materials (env-mapped), plus an HDR
 * glow mesh that feeds bloom. Halo sprites only on the low tier.
 */

// —— shared materials (created once; scene.environment feeds them) ——
const MATERIALS: Record<Exclude<MatClass, "glow">, THREE.Material> = {
  matte: new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8, // 0.7–0.9 matte band (dirt/stone/wood)
    metalness: 0.0,
    envMapIntensity: 0.45,
  }),
  gloss: new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.34, // the wet "RTX sheen" band (0.3–0.45)
    metalness: 0.06,
    envMapIntensity: 1.2,
  }),
  metal: new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.88,
    envMapIntensity: 1.4,
  }),
  water: new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.06,
    metalness: 0.0,
    transparent: true,
    opacity: 0.86,
    envMapIntensity: 1.6,
  }),
};

// glow: unlit, HDR-boosted past 1.0 so bloom catches it
const GLOW_MATERIAL = new THREE.MeshBasicMaterial({
  vertexColors: true,
  toneMapped: false,
  color: new THREE.Color(1.9, 1.9, 1.9),
});

const SHADOW_CLASSES: ReadonlySet<string> = new Set(["matte", "gloss", "metal"]);

export interface VoxelMeshProps {
  build: () => VoxelModel;
  deps?: readonly unknown[];
  /** 'bottom' = x/z centered, y=0 at model floor (default) · 'origin' = raw coords */
  anchor?: "bottom" | "origin" | "center";
  castShadow?: boolean;
  receiveShadow?: boolean;
  maxHalos?: number;
  haloScale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export function VoxelMesh({
  build,
  deps = [],
  anchor = "bottom",
  castShadow = true,
  receiveShadow = true,
  maxHalos = 6,
  haloScale = 1,
  position,
  rotation,
  scale,
}: VoxelMeshProps) {
  const quality = useWorld((s) => s.quality);

  const { geos, halos, offset } = useMemo(() => {
    const model = build();
    const res: MeshResult = meshVoxels(model);
    const geos: { cls: MatClass; geo: THREE.BufferGeometry }[] = [];
    for (const [cls, buf] of Object.entries(res.groups) as [MatClass, MeshBuffers][]) {
      if (!buf || buf.positions.length === 0) continue;
      geos.push({ cls, geo: toGeometry(buf) });
    }
    const offset: [number, number, number] =
      anchor === "bottom"
        ? [-model.nx / 2, 0, -model.nz / 2]
        : anchor === "center"
          ? [-model.nx / 2, -model.ny / 2, -model.nz / 2]
          : [0, 0, 0];
    const halos = [...res.halos]
      .sort((a, b) => b.count - a.count)
      .slice(0, maxHalos);
    return { geos, halos, offset };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(
    () => () => {
      for (const { geo } of geos) geo.dispose();
    },
    [geos]
  );

  // bloom replaces halos on high/medium; sprites only for the low tier
  const showHalos = quality === "low";

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={offset}>
        {geos.map(({ cls, geo }) => (
          <mesh
            key={cls}
            geometry={geo}
            material={cls === "glow" ? GLOW_MATERIAL : MATERIALS[cls as Exclude<MatClass, "glow">]}
            castShadow={castShadow && SHADOW_CLASSES.has(cls)}
            receiveShadow={receiveShadow && SHADOW_CLASSES.has(cls)}
          />
        ))}
        {showHalos &&
          halos.map((h, i) => (
            <sprite
              key={i}
              position={h.pos}
              scale={
                (2.2 + Math.min(6, Math.sqrt(h.count)) * 1.4) *
                h.strength *
                haloScale
              }
            >
              <spriteMaterial
                map={getHaloTexture()}
                color={h.color}
                transparent
                opacity={0.5 * h.strength}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </sprite>
          ))}
      </group>
    </group>
  );
}

function toGeometry(buf: MeshBuffers): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(buf.positions, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(buf.normals, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(buf.colors, 3));
  geo.computeBoundingSphere();
  return geo;
}

// —— shared radial glow texture (lazy singleton, low-tier halos) ——
let haloTex: THREE.CanvasTexture | null = null;

export function getHaloTexture(): THREE.CanvasTexture {
  if (haloTex) return haloTex;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(0.6, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  haloTex = new THREE.CanvasTexture(canvas);
  return haloTex;
}
