"use client";

import { Text, Billboard } from "@react-three/drei";

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
  // generous board so text never clips (no maxWidth on the Text)
  const width = Math.max(text.length, sub ? sub.length * 0.72 : 0) * s * 0.7 + s * 1.8;
  const height = sub ? s * 2.7 : s * 1.9;

  return (
    <group position={position} rotation={rotation}>
      {postHeight > 0 && (
        <>
          <mesh position={[-width / 2 + 0.3, -postHeight / 2, 0]} castShadow>
            <boxGeometry args={[0.5, postHeight, 0.5]} />
            <meshStandardMaterial color="#4a3320" roughness={0.85} />
          </mesh>
          <mesh position={[width / 2 - 0.3, -postHeight / 2, 0]} castShadow>
            <boxGeometry args={[0.5, postHeight, 0.5]} />
            <meshStandardMaterial color="#4a3320" roughness={0.85} />
          </mesh>
        </>
      )}
      {/* the board faces the camera; it floats in open sky above its island,
          so normal depth + fog apply — distant signs melt into the haze */}
      <Billboard follow>
        {/* thin wood frame */}
        <mesh position={[0, 0, -0.04]}>
          <planeGeometry args={[width + 0.5, height + 0.5]} />
          <meshBasicMaterial color="#5a3f28" />
        </mesh>
        {/* dark board */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color="#211812" transparent opacity={0.94} depthWrite={false} />
        </mesh>
        <Text
          font="/fonts/SpaceGrotesk.ttf"
          fontSize={s}
          color={color}
          anchorX="center"
          anchorY={sub ? "bottom" : "middle"}
          position={[0, sub ? 0.12 : 0, 0.02]}
          outlineWidth={s * 0.06}
          outlineColor="#211812"
          textAlign="center"
        >
          {text}
        </Text>
        {sub && (
          <Text
            font="/fonts/SpaceGrotesk.ttf"
            fontSize={s * 0.5}
            color="#ffcf87"
            anchorX="center"
            anchorY="top"
            position={[0, -0.08, 0.02]}
            outlineWidth={s * 0.04}
            outlineColor="#211812"
            textAlign="center"
          >
            {sub}
          </Text>
        )}
      </Billboard>
    </group>
  );
}
