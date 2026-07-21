"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import type { Content } from "@/content/types";
import { REALMS, PROJECT_ISLAND_OFFSETS } from "../layout";
import { VoxelMesh } from "../VoxelMesh";
import { buildMeridianIsland, MERIDIAN_TOP, MERIDIAN_POI } from "../structures/meridian";
import { buildTarkIsland, TARK_TOP, TARK_POI } from "../structures/tark";
import { buildCabIsland, CAB_TOP, CAB_POI } from "../structures/campuscab";
import { FloatingRock } from "./common";

/**
 * The Projects archipelago — three bespoke islands (Meridian, TARK, Campus Cab),
 * each with a billboarded holo-screen that faces the visitor and shows the work.
 */
export default function ProjectsRealm({ content }: { content: Content }) {
  const base = REALMS.projects.pos;
  const has = (slug: string) => content.projects.some((p) => p.slug === slug);

  return (
    <group>
      {has("meridian") && <MeridianIsland base={base} />}
      {has("tark") && <TarkIsland base={base} />}
      {has("campuscab") && <CabIsland base={base} />}
      <FloatingRock position={[base[0] - 44, base[1] + 12, base[2] + 26]} seed={201} size={4} />
      <FloatingRock position={[base[0] + 40, base[1] - 8, base[2] - 34]} seed={202} size={5} />
      <FloatingRock position={[base[0] - 26, base[1] + 18, base[2] - 42]} seed={203} size={3} />
    </group>
  );
}

function islandPos(
  base: [number, number, number],
  slug: string,
  top: number
): [number, number, number] {
  const off = PROJECT_ISLAND_OFFSETS[slug];
  return [base[0] + off[0], base[1] + off[1] - top, base[2] + off[2]];
}

// ---- a holo-screen that faces the camera and shows the project ----
function makeScreenTexture(title: string, subtitle: string, accent: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 384;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0c1820";
  g.fillRect(0, 0, 640, 384);
  g.strokeStyle = accent + "22";
  g.lineWidth = 1;
  for (let x = 0; x < 640; x += 32) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 384);
    g.stroke();
  }
  for (let y = 0; y < 384; y += 32) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(640, y);
    g.stroke();
  }
  // a lively data line
  const pts = [
    [60, 300], [150, 210], [250, 250], [340, 140], [430, 190], [540, 90], [600, 150],
  ];
  g.strokeStyle = accent;
  g.lineWidth = 4;
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.stroke();
  for (const [x, y] of pts) {
    g.fillStyle = accent;
    g.beginPath();
    g.arc(x, y, 6, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#eaf6fb";
  g.font = "bold 40px sans-serif";
  g.fillText(title, 28, 62);
  g.font = "20px sans-serif";
  g.fillStyle = accent;
  g.fillText(subtitle, 28, 94);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function HoloScreen({
  anchor,
  title,
  subtitle,
  accent,
}: {
  anchor: [number, number, number];
  title: string;
  subtitle: string;
  accent: string;
}) {
  const tex = useMemo(() => makeScreenTexture(title, subtitle, accent), [title, subtitle, accent]);
  return (
    <Billboard position={[anchor[0] - 32, anchor[1] + 3, anchor[2] - 32]}>
      {/* dark bezel */}
      <mesh position={[0, 0, -0.08]}>
        <planeGeometry args={[9.2, 5.7]} />
        <meshStandardMaterial color="#1a2630" />
      </mesh>
      {/* the glowing display */}
      <mesh>
        <planeGeometry args={[8.4, 5]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

// ————— Meridian —————
function MeridianIsland({ base }: { base: [number, number, number] }) {
  return (
    <group position={islandPos(base, "meridian", MERIDIAN_TOP)}>
      <VoxelMesh build={buildMeridianIsland} maxHalos={10} />
      <HoloScreen anchor={MERIDIAN_POI.screen} title="Meridian" subtitle="Multi-Agent Energy AI" accent="#8fd4e6" />
    </group>
  );
}

// ————— TARK —————
function TarkIsland({ base }: { base: [number, number, number] }) {
  return (
    <group position={islandPos(base, "tark", TARK_TOP)}>
      <VoxelMesh build={buildTarkIsland} maxHalos={10} />
      <HoloScreen anchor={TARK_POI.screen} title="TARK AI" subtitle="Legal Assistant" accent="#9ee6b0" />
    </group>
  );
}

// ————— Campus Cab —————
function CabIsland({ base }: { base: [number, number, number] }) {
  return (
    <group position={islandPos(base, "campuscab", CAB_TOP)}>
      <VoxelMesh build={buildCabIsland} maxHalos={10} />
      <HoloScreen anchor={CAB_POI.screen} title="Campus Cab" subtitle="Ride Pooling" accent="#ffc98a" />
    </group>
  );
}
