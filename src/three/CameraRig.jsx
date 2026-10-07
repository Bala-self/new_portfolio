import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { cameraCurve, targetCurve } from "./env";
import { getScroll, setSmooth, damp, clamp } from "../lib/scrollStore";

const pos = new THREE.Vector3();
const look = new THREE.Vector3();

/**
 * One continuous forward walk. Scroll position drives a damped parameter along
 * a Catmull-Rom path; everything else is small natural variation on top.
 */
export default function CameraRig({ motion = 1 }) {
  const { camera, size } = useThree();
  const state = useRef({ p: 0, speed: 0, bob: 0 });

  // a slightly wider lens on portrait screens so the beach still reads
  const fov = size.width / size.height < 0.95 ? 56 : 44;
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = state.current;
    const target = clamp(getScroll().progress);

    const prev = s.p;
    s.p = damp(s.p, target, 3.2, dt);
    setSmooth(s.p);

    const instantSpeed = Math.abs(s.p - prev) / Math.max(dt, 0.0001);
    s.speed = damp(s.speed, Math.min(instantSpeed * 6, 1), 4, dt);
    s.bob += dt * (0.9 + s.speed * 5.5);

    const t = clamp(s.p, 0, 1);
    cameraCurve.getPointAt(t, pos);
    targetCurve.getPointAt(t, look);

    const time = s.bob;
    const breath = Math.sin(time * 0.55) * 0.045 + Math.sin(time * 1.31) * 0.012;
    const sway = Math.sin(time * 0.37) * 0.07 + Math.sin(time * 0.91) * 0.018;
    const step = Math.sin(time * 2.6) * 0.022 * s.speed;

    camera.position.set(
      pos.x + sway * motion,
      pos.y + (breath + step) * motion,
      pos.z
    );

    look.x += Math.sin(time * 0.23) * 0.5 * motion;
    look.y += Math.sin(time * 0.41) * 0.12 * motion;
    camera.lookAt(look);
    camera.rotateZ(Math.sin(time * 0.29) * 0.0045 * motion);
  });

  return null;
}
