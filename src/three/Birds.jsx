import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Loose flocks plus a couple of singles. They sit in the upper part of the
// frame, above the papers and well clear of the typography, at a range of
// distances so some read as near and some as far off.
const FLOCKS = [
  { count: 5, dir: 1, speed: 2.4, dist: 70, alt: 20, spread: 12, flap: 3.1 },
  { count: 4, dir: -1, speed: 1.7, dist: 105, alt: 30, spread: 18, flap: 2.6 },
  { count: 3, dir: 1, speed: 3.1, dist: 140, alt: 24, spread: 8, flap: 3.6 },
  { count: 1, dir: -1, speed: 2.0, dist: 180, alt: 34, spread: 0, flap: 3.3 },
  { count: 1, dir: 1, speed: 1.4, dist: 230, alt: 44, spread: 0, flap: 2.2 },
];

const TOTAL = FLOCKS.reduce((n, f) => n + f.count, 0);

function birdGeometry() {
  const g = new THREE.BufferGeometry();
  const v = new Float32Array([
    -1, 0, 0.10, 0, 0, -0.14, 0, 0, 0.14,
    1, 0, 0.10, 0, 0, 0.14, 0, 0, -0.14,
  ]);
  g.setAttribute("position", new THREE.BufferAttribute(v, 3));
  return g;
}

const vertex = /* glsl */ `
  attribute float aPhase;
  attribute float aFlap;
  uniform float uTime;
  varying float vFog;

  void main() {
    vec3 p = position;
    float wing = pow(abs(p.x), 1.6);
    p.y += sin(uTime * aFlap + aPhase) * wing * 0.42;
    p.z += wing * 0.06 * sin(uTime * aFlap + aPhase + 1.2);

    vec4 world = instanceMatrix * vec4(p, 1.0);
    vec4 mv = modelViewMatrix * world;
    vFog = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform vec3 uFog;
  varying float vFog;

  void main() {
    // Only a light wash toward the haze, so a bird keeps its shape and its
    // contrast however far out it is.
    float f = clamp(vFog / 460.0, 0.0, 1.0);
    vec3 col = mix(uColor, uFog, f * 0.45);
    gl_FragColor = vec4(col, 1.0 - f * 0.18);
    #include <colorspace_fragment>
  }
`;

export default function Birds({ palette, count = TOTAL, color = "#1d2c38" }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geometry = useMemo(birdGeometry, []);

  const birds = useMemo(() => {
    const list = [];
    for (const f of FLOCKS) {
      for (let n = 0; n < f.count; n++) {
        list.push({
          flock: f,
          ox: (Math.random() - 0.5) * f.spread - n * 1.6 * f.dir,
          oy: (Math.random() - 0.5) * f.spread * 0.35,
          oz: (Math.random() - 0.5) * f.spread * 0.8,
          seed: Math.random() * 100,
          scale: 1.6 + Math.random() * 1.0,
          start: Math.random() * 620 - 310,
        });
      }
    }
    return list.slice(0, count);
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(color) },
          uFog: { value: new THREE.Color(palette.fog) },
        },
      }),
    []
  );
  material.uniforms.uFog.value.copy(palette.fog);
  material.uniforms.uColor.value.set(color);

  const attrs = useMemo(() => {
    const phase = new Float32Array(birds.length);
    const flap = new Float32Array(birds.length);
    birds.forEach((b, i) => {
      phase[i] = Math.random() * Math.PI * 2;
      flap[i] = b.flock.flap * (0.85 + Math.random() * 0.3);
    });
    return { phase, flap };
  }, [birds]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cam = state.camera.position;
    material.uniforms.uTime.value = t;
    const mesh = ref.current;
    if (!mesh) return;

    for (let i = 0; i < birds.length; i++) {
      const b = birds[i];
      const f = b.flock;
      let x = b.start + f.dir * f.speed * t + b.ox;
      const span = 620;
      x = ((((x + span / 2) % span) + span) % span) - span / 2;

      const y = f.alt + b.oy + Math.sin(t * 0.3 + b.seed) * 1.8;
      const z = cam.z - f.dist + b.oz + Math.sin(t * 0.17 + b.seed) * 6.0;

      dummy.position.set(x + cam.x * 0.4, y, z);
      dummy.rotation.set(
        Math.sin(t * 0.5 + b.seed) * 0.08,
        f.dir > 0 ? -Math.PI / 2 : Math.PI / 2,
        Math.sin(t * 0.33 + b.seed) * 0.12
      );
      dummy.scale.setScalar(b.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, birds.length]}
      frustumCulled={false}
    >
      <instancedBufferAttribute
        attach="geometry-attributes-aPhase"
        args={[attrs.phase, 1]}
      />
      <instancedBufferAttribute
        attach="geometry-attributes-aFlap"
        args={[attrs.flap, 1]}
      />
    </instancedMesh>
  );
}
