"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useWorld } from "./store";
import { REALMS } from "./layout";
import { audio } from "@/lib/audio";

/**
 * The cinematic camera. Menu phase: a slow establishing orbit around the
 * hub. World phase: GSAP arc flights between stops, idle drift while
 * parked, soft pointer parallax. No user camera control — a directed diorama.
 */

// module-level rig so Kip (and effects) can read flight state
export const rig = {
  pos: new THREE.Vector3(52, 30, 60),
  target: new THREE.Vector3(0, 6, 0),
  flying: false,
  /** active GSAP timeline — kill before teleporting the rig */
  activeTl: null as gsap.core.Timeline | null,
};

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const stops = useWorld((s) => s.stops);
  const targetIndex = useWorld((s) => s.targetIndex);
  const phase = useWorld((s) => s.phase);
  const parallax = useRef(new THREE.Vector2());
  const tl = useRef<gsap.core.Timeline | null>(null);
  const menuAngle = useRef(Math.PI * 0.35);

  const tmp = useMemo(
    () => ({
      p1: new THREE.Vector3(),
      curve: new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
      ),
      look: new THREE.Vector3(),
    }),
    []
  );

  // — leaving the menu: glide from the orbit into the current stop —
  useEffect(() => {
    if (phase !== "world" || stops.length === 0) return;
    const st = useWorld.getState();
    if (st.targetIndex !== null) return; // realm flight already queued
    const stop = stops[st.stopIndex];
    flyTo(
      new THREE.Vector3(...stop.cam),
      new THREE.Vector3(...stop.target),
      3.2,
      () => {
        rig.flying = false;
      }
    );
    audio.whoosh(2.6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // — stop-to-stop flights —
  useEffect(() => {
    if (targetIndex === null || stops.length === 0) return;
    const stop = stops[targetIndex];
    const dest = new THREE.Vector3(...stop.cam);
    const destT = new THREE.Vector3(...stop.target);
    const dist = rig.pos.distanceTo(dest);
    const duration = THREE.MathUtils.clamp(dist / 26, 1.4, 4.6);
    audio.whoosh(duration);
    flyTo(dest, destT, duration, () => {
      rig.flying = false;
      useWorld.getState().arrive();
    });
    return () => {
      tl.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIndex, stops]);

  function flyTo(
    dest: THREE.Vector3,
    destT: THREE.Vector3,
    duration: number,
    onComplete: () => void
  ) {
    tl.current?.kill();
    rig.flying = true;
    const from = rig.pos.clone();
    const fromT = rig.target.clone();
    const dist = from.distanceTo(dest);
    tmp.p1
      .addVectors(from, dest)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(0, Math.min(10 + dist * 0.22, 46), 0));
    tmp.curve.v0.copy(from);
    tmp.curve.v1.copy(tmp.p1);
    tmp.curve.v2.copy(dest);

    const proxy = { t: 0 };
    tl.current = gsap.timeline({ onComplete });
    rig.activeTl = tl.current;
    tl.current.to(proxy, {
      t: 1,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        tmp.curve.getPoint(proxy.t, rig.pos);
        rig.target.lerpVectors(fromT, destT, smooth(proxy.t));
      },
    });
  }

  useFrame((state, dt) => {
    // menu backdrop: slow orbit high over the hub
    if (useWorld.getState().phase === "menu" && !rig.flying) {
      menuAngle.current += dt * 0.05;
      const hub = REALMS.hub.pos;
      rig.pos.set(
        hub[0] + Math.cos(menuAngle.current) * 54,
        hub[1] + 26 + Math.sin(menuAngle.current * 0.7) * 4,
        hub[2] + Math.sin(menuAngle.current) * 54
      );
      rig.target.set(hub[0], hub[1] + 5, hub[2]);
    }

    // pointer parallax — only when parked (never nudges an in-flight path)
    const parked = !rig.flying && useWorld.getState().phase === "world";
    parallax.current.x = THREE.MathUtils.damp(
      parallax.current.x, parked ? state.pointer.x : 0, 2.2, dt
    );
    parallax.current.y = THREE.MathUtils.damp(
      parallax.current.y, parked ? state.pointer.y : 0, 2.2, dt
    );

    const t = state.clock.elapsedTime;
    // slow idle breathing only when parked; flights stay perfectly steady
    const idle = rig.flying ? 0 : 1;
    const dx = Math.sin(t * 0.12) * 0.35 * idle + parallax.current.x * 0.8;
    const dy = Math.sin(t * 0.09) * 0.22 * idle + parallax.current.y * 0.5;
    const dz = Math.cos(t * 0.1) * 0.28 * idle;

    camera.position.set(rig.pos.x + dx, rig.pos.y + dy, rig.pos.z + dz);
    tmp.look.set(
      rig.target.x + parallax.current.x * 0.4,
      rig.target.y + parallax.current.y * 0.25,
      rig.target.z
    );
    camera.lookAt(tmp.look);

    // subtle FOV breathing in flight
    const persp = camera as THREE.PerspectiveCamera;
    if (persp.isPerspectiveCamera) {
      const wantFov = rig.flying ? 48 : 45;
      const next = THREE.MathUtils.damp(persp.fov, wantFov, 2, dt);
      if (Math.abs(next - persp.fov) > 0.01) {
        persp.fov = next;
        persp.updateProjectionMatrix();
      }
    }
  });

  return null;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}
