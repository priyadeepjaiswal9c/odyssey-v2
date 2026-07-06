"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useWorld } from "./store";

/**
 * The cinematic camera: GSAP arc flights between stops, a gentle idle
 * drift while parked, and soft pointer parallax. No user-controlled
 * camera — the world is a directed diorama.
 */

// module-level rig so Kip (and others) can read flight state
export const rig = {
  pos: new THREE.Vector3(46, 40, 66),
  target: new THREE.Vector3(0, 6, 0),
  flying: false,
};

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const stops = useWorld((s) => s.stops);
  const targetIndex = useWorld((s) => s.targetIndex);
  const parallax = useRef(new THREE.Vector2());
  const booted = useRef(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const tmp = useMemo(
    () => ({
      p0: new THREE.Vector3(),
      p1: new THREE.Vector3(),
      p2: new THREE.Vector3(),
      t0: new THREE.Vector3(),
      curve: new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
      ),
      look: new THREE.Vector3(),
    }),
    []
  );

  // — intro: pull back from stop 0 and glide in —
  useEffect(() => {
    if (booted.current || stops.length === 0) return;
    booted.current = true;
    const s0 = stops[0];
    const dest = new THREE.Vector3(...s0.cam);
    const destT = new THREE.Vector3(...s0.target);
    // start far out along the same sightline, higher up
    rig.pos.copy(dest).sub(destT).multiplyScalar(3.2).add(destT).add(new THREE.Vector3(0, 26, 0));
    rig.target.copy(destT).add(new THREE.Vector3(0, 10, 0));
    rig.flying = true;
    const proxy = { t: 0 };
    const from = rig.pos.clone();
    const fromT = rig.target.clone();
    gsap.to(proxy, {
      t: 1,
      duration: 4.2,
      ease: "power3.inOut",
      onUpdate: () => {
        rig.pos.lerpVectors(from, dest, proxy.t);
        rig.target.lerpVectors(fromT, destT, proxy.t);
      },
      onComplete: () => {
        rig.flying = false;
      },
    });
  }, [stops]);

  // — flights —
  useEffect(() => {
    if (targetIndex === null || stops.length === 0) return;
    const stop = stops[targetIndex];
    const dest = new THREE.Vector3(...stop.cam);
    const destT = new THREE.Vector3(...stop.target);

    tl.current?.kill();
    rig.flying = true;

    const from = rig.pos.clone();
    const fromT = rig.target.clone();
    const dist = from.distanceTo(dest);

    // arc control point: midpoint raised + pushed outward
    tmp.p1
      .addVectors(from, dest)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(0, Math.min(10 + dist * 0.22, 46), 0));
    tmp.curve.v0.copy(from);
    tmp.curve.v1.copy(tmp.p1);
    tmp.curve.v2.copy(dest);

    const duration = THREE.MathUtils.clamp(dist / 26, 1.4, 4.6);
    const proxy = { t: 0 };
    tl.current = gsap.timeline({
      onComplete: () => {
        rig.flying = false;
        useWorld.getState().arrive();
      },
    });
    tl.current.to(proxy, {
      t: 1,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        tmp.curve.getPoint(proxy.t, rig.pos);
        rig.target.lerpVectors(fromT, destT, easeLook(proxy.t));
      },
    });

    return () => {
      tl.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIndex, stops]);

  useFrame((state, dt) => {
    // soft pointer parallax (damped)
    parallax.current.x = THREE.MathUtils.damp(
      parallax.current.x, state.pointer.x, 2.2, dt
    );
    parallax.current.y = THREE.MathUtils.damp(
      parallax.current.y, state.pointer.y, 2.2, dt
    );

    const t = state.clock.elapsedTime;
    // idle breathing drift, muted while flying
    const idle = rig.flying ? 0.25 : 1;
    const dx = Math.sin(t * 0.14) * 0.9 * idle + parallax.current.x * 1.6;
    const dy = Math.sin(t * 0.1) * 0.5 * idle + parallax.current.y * 0.9;
    const dz = Math.cos(t * 0.12) * 0.7 * idle;

    camera.position.set(rig.pos.x + dx, rig.pos.y + dy, rig.pos.z + dz);
    tmp.look.set(
      rig.target.x + parallax.current.x * 0.8,
      rig.target.y + parallax.current.y * 0.5,
      rig.target.z
    );
    camera.lookAt(tmp.look);
  });

  return null;
}

/** look target leads slightly, then settles */
function easeLook(t: number): number {
  return t * t * (3 - 2 * t);
}
