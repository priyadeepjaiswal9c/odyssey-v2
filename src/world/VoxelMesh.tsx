"use client";

import { useMemo, useEffect } from "react";
import * as THREE from "three";
import { meshVoxels, type MeshResult } from "@/lib/voxel/mesh";
import type { VoxelModel } from "@/lib/voxel/model";

/**
 * Renders a VoxelModel: one lit mesh (baked AO/tint vertex colors),
 * one unlit glow mesh, and additive halo sprites over emissive clusters.
 */

export interface VoxelMeshProps {
  /** built once per deps change — keep it pure + deterministic */
  build: () => VoxelModel;
  /** memo key — rebuild when these change */
  deps?: readonly unknown[];
  /** 'bottom' = x/z centered, y=0 at model floor (default) · 'origin' = raw model coords */
  anchor?: "bottom" | "origin" | "center";
  castShadow?: boolean;
  receiveShadow?: boolean;
  /** clamp on halo sprite count (biggest clusters win) */
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
  castShadow = false,
  receiveShadow = false,
  maxHalos = 6,
  haloScale = 1,
  position,
  rotation,
  scale,
}: VoxelMeshProps) {
  const { litGeo, glowGeo, halos, offset } = useMemo(() => {
    const model = build();
    const res: MeshResult = meshVoxels(model);
    const litGeo = toGeometry(res.lit);
    const glowGeo = res.glow.positions.length ? toGeometry(res.glow) : null;
    const offset: [number, number, number] =
      anchor === "bottom"
        ? [-model.nx / 2, 0, -model.nz / 2]
        : anchor === "center"
          ? [-model.nx / 2, -model.ny / 2, -model.nz / 2]
          : [0, 0, 0];
    const halos = [...res.halos]
      .sort((a, b) => b.count - a.count)
      .slice(0, maxHalos);
    return { litGeo, glowGeo, halos, offset };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(
    () => () => {
      litGeo.dispose();
      glowGeo?.dispose();
    },
    [litGeo, glowGeo]
  );

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={offset}>
        <mesh
          geometry={litGeo}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        >
          <meshLambertMaterial vertexColors />
        </mesh>
        {glowGeo && (
          <mesh geometry={glowGeo}>
            <meshBasicMaterial vertexColors toneMapped={false} />
          </mesh>
        )}
        {halos.map((h, i) => (
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
              opacity={0.55 * h.strength}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        ))}
      </group>
    </group>
  );
}

function toGeometry(buf: {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
}): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(buf.positions, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(buf.normals, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(buf.colors, 3));
  geo.computeBoundingSphere();
  return geo;
}

// —— shared radial glow texture (lazy singleton) ——
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
