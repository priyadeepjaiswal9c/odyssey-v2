"use client";

import { Text } from "@react-three/drei";

/**
 * In-world Monocraft sign — SDF text (troika via drei) on a wooden plank,
 * crisp at any distance or angle. Every structure gets one (labels also
 * live in the DOM via the Classic view for a11y).
 */
export function Sign({
  text,
  sub,
  position,
  rotation = [0, 0, 0],
  size = 1.6,
  plank = true,
  postHeight = 0,
  color = "#ffe9c4",
}: {
  text: string;
  sub?: string;
  /** position of the sign's CENTER */
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: number;
  plank?: boolean;
  /** >0 → wooden posts running from the plank down this many units to the ground */
  postHeight?: number;
  color?: string;
}) {
  // clamp a readable minimum — many call sites shrink labels to ~0.5
  const s = Math.max(size, 0.9);
  const width = Math.max(text.length, sub ? sub.length * 0.62 : 0) * s * 0.62 + s;
  const height = sub ? s * 2.6 : s * 1.8;

  return (
    <group position={position} rotation={rotation}>
      {/* always-on dark backing so text stays legible even without a plank */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width * 0.94, height * 0.8]} />
        <meshBasicMaterial color="#1c140c" transparent opacity={0.6} />
      </mesh>
      {plank && (
        <>
          <mesh position={[0, 0, -0.18]} castShadow>
            <boxGeometry args={[width, height, 0.32]} />
            <meshStandardMaterial color="#6b4a2e" roughness={0.82} />
          </mesh>
          {/* plank frame */}
          <mesh position={[0, height / 2, -0.18]}>
            <boxGeometry args={[width + 0.3, 0.24, 0.4]} />
            <meshStandardMaterial color="#4a3320" roughness={0.85} />
          </mesh>
          <mesh position={[0, -height / 2, -0.18]}>
            <boxGeometry args={[width + 0.3, 0.24, 0.4]} />
            <meshStandardMaterial color="#4a3320" roughness={0.85} />
          </mesh>
        </>
      )}
      {postHeight > 0 && (
        <>
          <mesh position={[-width / 2 + 0.3, -postHeight / 2, -0.2]} castShadow>
            <boxGeometry args={[0.5, postHeight, 0.5]} />
            <meshStandardMaterial color="#4a3320" roughness={0.85} />
          </mesh>
          <mesh position={[width / 2 - 0.3, -postHeight / 2, -0.2]} castShadow>
            <boxGeometry args={[0.5, postHeight, 0.5]} />
            <meshStandardMaterial color="#4a3320" roughness={0.85} />
          </mesh>
        </>
      )}
      <Text
        font="/fonts/SpaceGrotesk.ttf"
        fontSize={s}
        color={color}
        anchorX="center"
        anchorY={sub ? "bottom" : "middle"}
        position={[0, sub ? 0.12 : 0, 0.02]}
        outlineWidth={s * 0.09}
        outlineColor="#241c12"
        maxWidth={width - s * 0.6}
        textAlign="center"
      >
        {text}
      </Text>
      {sub && (
        <Text
          font="/fonts/SpaceGrotesk.ttf"
          fontSize={s * 0.52}
          color="#ffcf87"
          anchorX="center"
          anchorY="top"
          position={[0, -0.08, 0.02]}
          outlineWidth={s * 0.05}
          outlineColor="#241c12"
          maxWidth={width - s * 0.6}
          textAlign="center"
        >
          {sub}
        </Text>
      )}
    </group>
  );
}
