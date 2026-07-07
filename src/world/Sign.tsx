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
  const width = Math.max(text.length, sub ? sub.length * 0.62 : 0) * size * 0.62 + size;
  const height = sub ? size * 2.6 : size * 1.8;

  return (
    <group position={position} rotation={rotation}>
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
        font="/fonts/Monocraft.ttf"
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY={sub ? "bottom" : "middle"}
        position={[0, sub ? 0.12 : 0, 0.02]}
        outlineWidth={size * 0.06}
        outlineColor="#241c12"
        maxWidth={width - size * 0.6}
        textAlign="center"
      >
        {text}
      </Text>
      {sub && (
        <Text
          font="/fonts/Monocraft.ttf"
          fontSize={size * 0.52}
          color="#ffb84d"
          anchorX="center"
          anchorY="top"
          position={[0, -0.08, 0.02]}
          outlineWidth={size * 0.03}
          outlineColor="#241c12"
          maxWidth={width - size * 0.6}
          textAlign="center"
        >
          {sub}
        </Text>
      )}
    </group>
  );
}
