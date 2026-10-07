import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { getScroll, clamp, smoothstep, damp, lerp } from "../lib/scrollStore";

// drei renders transformed HTML at (px * distanceFactor / 400) world units.
export const DF = 2.2;
export const PX_PER_UNIT = 400 / DF;

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3();
const target = new THREE.Vector3();

/** A sheet with a very slight curl, so it never reads as a flat rectangle. */
function sheetGeometry(w, h, curl) {
  const g = new THREE.PlaneGeometry(w, h, 14, 10);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const u = x / w; // -0.5 .. 0.5
    const v = y / h;
    const z =
      Math.cos(u * Math.PI) * curl * 0.5 +
      Math.sin(v * Math.PI * 1.1) * curl * 0.18 +
      u * v * curl * 0.5;
    pos.setZ(i, z);
  }
  g.computeVertexNormals();
  return g;
}

const DEFAULTS = {
  enterDist: 11,
  readDist: 4.6,
  exitDist: 2.6,
  enterX: 7.5,
  readX: 0.1,
  exitX: -6.5,
  enterY: 2.6,
  readY: 0.16,
  exitY: 2.2,
  restRoll: 0.02,
  curl: 0.1,
  lag: 2.4,
};

/**
 * One wind-carried sheet.
 * The paper itself is a lit 3D mesh; the words on it are real DOM text.
 */
export default function Paper({
  range,
  width,
  height,
  palette,
  motion = 1,
  config = {},
  seed = 0,
  className = "",
  children,
}) {
  const cfg = { ...DEFAULTS, ...config };
  const [start, end] = range;
  const group = useRef();
  const meshRef = useRef();
  const domRef = useRef();
  const [live, setLive] = useState(false);
  const inited = useRef(false);

  const w = width / PX_PER_UNIT;
  const h = height / PX_PER_UNIT;

  const geometry = useMemo(() => sheetGeometry(w, h, cfg.curl), [w, h, cfg.curl]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.94,
        metalness: 0,
        side: THREE.DoubleSide,
        transparent: true,
        flatShading: false,
      }),
    []
  );
  material.color.copy(palette.paper);
  material.emissive.copy(palette.paperEmissive);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = getScroll().smooth;
    const t = (p - start) / (end - start);

    const shouldLive = t > -0.12 && t < 1.12;
    if (shouldLive !== live) {
      setLive(shouldLive);
      if (!shouldLive) inited.current = false;
    }
    if (!shouldLive || !group.current) return;

    const tc = clamp(t);
    const camera = state.camera;
    const time = state.clock.elapsedTime;

    // camera basis
    camera.getWorldDirection(forward);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);

    const enter = smoothstep(0.0, 0.32, tc);
    const exit = smoothstep(0.72, 1.0, tc);

    const dist =
      lerp(cfg.enterDist, cfg.readDist, enter) +
      exit * (cfg.exitDist - cfg.readDist);
    const lat =
      lerp(cfg.enterX, cfg.readX, enter) + exit * (cfg.exitX - cfg.readX);
    const vert =
      lerp(cfg.enterY, cfg.readY, enter) + exit * (cfg.exitY - cfg.readY);

    // wind: strong while the sheet travels, almost still while it is read
    const gust = (0.14 + (1 - enter) * 0.9 + exit * 1.15) * motion;
    const nx = Math.sin(time * 0.83 + seed) * 0.6 + Math.sin(time * 1.9 + seed * 2.1) * 0.22;
    const ny = Math.sin(time * 0.61 + seed * 1.7) * 0.5 + Math.sin(time * 1.43 + seed) * 0.18;
    const nz = Math.sin(time * 0.47 + seed * 3.3) * 0.4;

    target
      .copy(camera.position)
      .addScaledVector(forward, dist + nz * gust * 0.5)
      .addScaledVector(right, lat + nx * gust)
      .addScaledVector(up, vert + ny * gust * 0.7);

    if (!inited.current) {
      group.current.position.copy(target);
      inited.current = true;
    } else {
      const l = cfg.lag + enter * 1.4;
      group.current.position.set(
        damp(group.current.position.x, target.x, l, dt),
        damp(group.current.position.y, target.y, l, dt),
        damp(group.current.position.z, target.z, l, dt)
      );
    }

    // orientation: face the reader, flutter on the way in and out
    group.current.lookAt(camera.position);
    const flutter = ((1 - enter) * 1.0 + exit * 1.2) * motion;
    group.current.rotateY(
      (Math.sin(time * 1.1 + seed) * (0.045 + flutter * 0.9) + cfg.restRoll) * motion
    );
    group.current.rotateX(Math.sin(time * 0.87 + seed * 2.2) * (0.03 + flutter * 0.55) * motion);
    group.current.rotateZ(
      (Math.sin(time * 0.69 + seed * 1.3) * (0.025 + flutter * 0.7) + cfg.restRoll * 0.6) * motion
    );

    const opacity =
      smoothstep(0.0, 0.1, tc) * (1 - smoothstep(0.88, 1.0, tc));
    material.opacity = opacity;
    if (domRef.current) {
      domRef.current.style.opacity = opacity.toFixed(3);
      domRef.current.style.pointerEvents =
        opacity > 0.9 && tc > 0.25 && tc < 0.8 ? "auto" : "none";
    }
  });

  return (
    <group ref={group}>
      {live && (
        <>
          <mesh ref={meshRef} geometry={geometry} material={material} />
          <Html
            transform
            distanceFactor={DF}
            occlude={false}
            zIndexRange={[12, 0]}
            position={[0, 0, cfg.curl * 0.5 + 0.006]}
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            <div
              ref={domRef}
              className={`sheet relative h-full w-full select-none overflow-hidden ${className}`}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                opacity: 0,
                pointerEvents: "none",
              }}
            >
              {children}
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
