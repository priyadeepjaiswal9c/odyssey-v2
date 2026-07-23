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
 * hub. World phase: GSAP arc flights between stops, idle drift while parked,
 * soft pointer parallax — AND drag-to-look-around, so a visitor can grab
 * any island and orbit it. Releasing keeps the new angle; scrolling to the
 * next stop re-frames cleanly.
 */

// module-level rig so Kip (and effects) can read flight state
export const rig = {
  pos: new THREE.Vector3(52, 30, 60),
  target: new THREE.Vector3(0, 6, 0),
  flying: false,
  /** active GSAP timeline — kill before teleporting the rig */
  activeTl: null as gsap.core.Timeline | null,
};

// user look-around, orbiting the parked target. Damped toward the drag
// target; forced back to 0 during flights so each stop frames the same way.
const orbit = {
  yaw: 0,
  pitch: 0,
  tYaw: 0,
  tPitch: 0,
  dragging: false,
};
const YAW_MAX = 0.9;
const PITCH_MIN = -0.5;
const PITCH_MAX = 0.55;

// a soft ring cursor — outline when you can grab, filled while dragging.
// built + encoded at runtime so the data-URI is always valid (falls back
// to native grab/grabbing if a browser refuses SVG cursors).
function ringCursor(filled: boolean): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'>` +
    `<circle cx='15' cy='15' r='10' ${
      filled ? "fill='rgba(255,201,128,0.28)'" : "fill='none'"
    } stroke='rgb(255,235,205)' stroke-width='1.8'/>` +
    `<circle cx='15' cy='15' r='${filled ? 2.6 : 1.9}' fill='rgb(255,235,205)'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 15 15, ${
    filled ? "grabbing" : "grab"
  }`;
}
const CURSOR_GRAB = ringCursor(false);
const CURSOR_DRAG = ringCursor(true);

/** clear the look-around (call when a new flight begins) */
function resetOrbit() {
  orbit.tYaw = 0;
  orbit.tPitch = 0;
}

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
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
      off: new THREE.Vector3(),
      sph: new THREE.Spherical(),
      pos: new THREE.Vector3(),
    }),
    []
  );

  // — drag to look around the parked island —
  useEffect(() => {
    const el = gl.domElement;
    let lastX = 0;
    let lastY = 0;
    const canDrag = () => !rig.flying && useWorld.getState().phase === "world";

    const down = (e: PointerEvent) => {
      if (!canDrag() || e.button !== 0) return;
      orbit.dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.style.cursor = CURSOR_DRAG;
    };
    const move = (e: PointerEvent) => {
      if (!orbit.dragging) return;
      const dx = (e.clientX - lastX) / window.innerWidth;
      const dy = (e.clientY - lastY) / window.innerHeight;
      lastX = e.clientX;
      lastY = e.clientY;
      orbit.tYaw = THREE.MathUtils.clamp(orbit.tYaw - dx * 2.7, -YAW_MAX, YAW_MAX);
      orbit.tPitch = THREE.MathUtils.clamp(orbit.tPitch + dy * 2.0, PITCH_MIN, PITCH_MAX);
    };
    const up = () => {
      if (!orbit.dragging) return;
      orbit.dragging = false;
      el.style.cursor = canDrag() ? CURSOR_GRAB : "";
    };

    const syncCursor = () => {
      if (!orbit.dragging) el.style.cursor = canDrag() ? CURSOR_GRAB : "";
    };
    syncCursor();

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    const cursorTimer = window.setInterval(syncCursor, 400);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.clearInterval(cursorTimer);
      el.style.cursor = "";
    };
  }, [gl]);

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
    resetOrbit(); // re-frame each stop cleanly
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
    const st = useWorld.getState();

    // menu backdrop: slow orbit high over the hub
    if (st.phase === "menu" && !rig.flying) {
      menuAngle.current += dt * 0.05;
      const hub = REALMS.hub.pos;
      rig.pos.set(
        hub[0] + Math.cos(menuAngle.current) * 54,
        hub[1] + 26 + Math.sin(menuAngle.current * 0.7) * 4,
        hub[2] + Math.sin(menuAngle.current) * 54
      );
      rig.target.set(hub[0], hub[1] + 5, hub[2]);
    }

    // look-around: while flying, ease the offsets back to a clean frame
    if (rig.flying) resetOrbit();
    orbit.yaw = THREE.MathUtils.damp(orbit.yaw, orbit.tYaw, 9, dt);
    orbit.pitch = THREE.MathUtils.damp(orbit.pitch, orbit.tPitch, 9, dt);

    // pointer parallax — only when parked and NOT actively dragging
    const parked = !rig.flying && st.phase === "world";
    const wantPar = parked && !orbit.dragging;
    parallax.current.x = THREE.MathUtils.damp(
      parallax.current.x, wantPar ? state.pointer.x : 0, 2.2, dt
    );
    parallax.current.y = THREE.MathUtils.damp(
      parallax.current.y, wantPar ? state.pointer.y : 0, 2.2, dt
    );

    // orbit the framed camera position around its target
    tmp.off.subVectors(rig.pos, rig.target);
    tmp.sph.setFromVector3(tmp.off);
    tmp.sph.theta += orbit.yaw;
    tmp.sph.phi = THREE.MathUtils.clamp(
      tmp.sph.phi - orbit.pitch,
      0.14 * Math.PI,
      0.62 * Math.PI
    );
    tmp.sph.makeSafe();
    tmp.off.setFromSpherical(tmp.sph);
    tmp.pos.addVectors(rig.target, tmp.off);

    const t = state.clock.elapsedTime;
    // slow idle breathing only when parked; flights stay perfectly steady.
    // the breathing also fades out while the visitor is actively dragging.
    const idle = rig.flying || orbit.dragging ? 0 : 1;
    const dx = Math.sin(t * 0.12) * 0.35 * idle + parallax.current.x * 0.8;
    const dy = Math.sin(t * 0.09) * 0.22 * idle + parallax.current.y * 0.5;
    const dz = Math.cos(t * 0.1) * 0.28 * idle;

    camera.position.set(tmp.pos.x + dx, tmp.pos.y + dy, tmp.pos.z + dz);
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
