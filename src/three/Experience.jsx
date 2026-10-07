import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { PALETTES } from "./env";
import CameraRig from "./CameraRig";
import SkyDome from "./SkyDome";
import Ocean from "./Ocean";
import Sand from "./Sand";
import Birds from "./Birds";
import Crab from "./Crab";
import Papers from "./Papers";

const TIERS = {
  high: {
    dpr: [1, 1.75],
    oceanSegments: 224,
    oceanRadius: 132,
    sand: [140, 220],
    octaves: 5,
    birds: 14,
    antialias: true,
  },
  mid: {
    dpr: [1, 1.5],
    oceanSegments: 150,
    oceanRadius: 110,
    sand: [100, 150],
    octaves: 4,
    birds: 10,
    antialias: true,
  },
  low: {
    dpr: [1, 1.3],
    oceanSegments: 92,
    oceanRadius: 84,
    sand: [64, 96],
    octaves: 3,
    birds: 7,
    antialias: false,
  },
};

/** The clear colour follows the mode, so a resize never flashes the wrong sky. */
function ClearColor({ color }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.setClearColor(color);
  }, [gl, color]);
  return null;
}

export default function Experience({ mode, tier = "high", compact, motion = 1, onOpen }) {
  const palette = PALETTES[mode];
  const q = TIERS[tier] || TIERS.mid;

  const sunPosition = useMemo(
    () => palette.sunDir.clone().multiplyScalar(60),
    [palette]
  );

  return (
    <Canvas
      flat
      dpr={q.dpr}
      gl={{
        antialias: q.antialias,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 44, near: 0.1, far: 3200, position: [0, 2.34, 14] }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color(palette.fog));
        scene.background = null;
      }}
      aria-hidden="true"
    >
      <CameraRig motion={motion} />
      <ClearColor color={palette.fog} />

      {/* these lights exist for one reason: the paper sheets */}
      <ambientLight
        color={palette.ambient}
        intensity={mode === "day" ? 0.55 : 0.5}
      />
      <directionalLight
        color={palette.light}
        intensity={mode === "day" ? 2.2 : 0.9}
        position={sunPosition}
      />
      {/* bounce off the water, so the back of a sheet is never pitch black */}
      <directionalLight
        color={palette.waterShallow}
        intensity={mode === "day" ? 0.5 : 0.15}
        position={[0, -20, 20]}
      />

      <Suspense fallback={null}>
        <SkyDome palette={palette} octaves={q.octaves} />
        <Ocean
          palette={palette}
          segments={q.oceanSegments}
          radius={q.oceanRadius}
        />
        <Sand palette={palette} segments={q.sand} />
        {/* birds in both modes: dark silhouettes by day, moonlit by night */}
        <Birds
          palette={palette}
          count={q.birds}
          color={mode === "day" ? "#1d2c38" : "#6e8799"}
        />
        <Crab mode={mode} />
        <Papers
          palette={palette}
          compact={compact}
          motion={motion}
          onOpen={onOpen}
        />
      </Suspense>
    </Canvas>
  );
}
