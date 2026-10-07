import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { NOISE_GLSL, SAND_HEIGHT_GLSL } from "./env";

const vertex = /* glsl */ `
  precision highp float;
  varying vec3 vWorld;
  varying vec3 vNormal;

  ${NOISE_GLSL}
  ${SAND_HEIGHT_GLSL}

  float beach(vec2 p) {
    float h = sandHeight(p.y);
    // low dunes, only on the dry side
    float dry = smoothstep(1.0, 14.0, p.y);
    h += (fbm(p * 0.035, 3) - 0.5) * 1.1 * dry;
    h += (fbm(p * 0.22, 2) - 0.5) * 0.05 * smoothstep(-2.0, 2.0, p.y);
    // gentle lateral wobble so the waterline is not a ruled line
    h += (fbm(vec2(p.x * 0.012, 4.0), 2) - 0.5) * 0.22 *
         (1.0 - smoothstep(0.0, 22.0, abs(p.y)));
    return h;
  }

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    world.y = beach(world.xz);

    float e = 1.0;
    float hx = beach(world.xz + vec2(e, 0.0));
    float hz = beach(world.xz + vec2(0.0, e));
    vNormal = normalize(vec3(-(hx - world.y) / e, 1.0, -(hz - world.y) / e));

    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec3 vWorld;
  varying vec3 vNormal;

  uniform vec3 uDry;
  uniform vec3 uWet;
  uniform vec3 uFoam;
  uniform vec3 uFog;
  uniform vec3 uLight;
  uniform vec3 uAmbient;
  uniform vec3 uSunDir;
  uniform vec3 uCamera;
  uniform float uLightIntensity;
  uniform float uAmbientIntensity;
  uniform float uFogDensity;
  uniform float uTime;

  ${NOISE_GLSL}

  void main() {
    vec3 N = normalize(vNormal);
    float dist = length(uCamera - vWorld);

    // grain, kept fine and only where it can actually be resolved
    float near = 1.0 - smoothstep(10.0, 70.0, dist);
    float grain = (fbm(vWorld.xz * 6.0, 2) - 0.5) * 0.085 * near;
    float ripple = (fbm(vec2(vWorld.x * 0.35, vWorld.z * 1.7), 2) - 0.5) * 0.05;

    float wet = smoothstep(2.6, -0.4, vWorld.z);
    vec3 albedo = mix(uDry, uWet, wet);
    albedo *= 1.0 + grain + ripple * (1.0 - wet);

    // thin line of dried foam left by the last wave
    float tide = smoothstep(0.55, 0.0, abs(vWorld.z - 1.25 - sin(vWorld.x * 0.05 + uTime * 0.12) * 0.5));
    albedo = mix(albedo, uFoam, tide * 0.22);

    // the sand colour is art-directed, light only shapes the dunes
    float lambert = max(dot(N, uSunDir), 0.0);
    float shade = 0.80 + 0.30 * lambert * uLightIntensity * 0.4;
    vec3 col = albedo * shade;
    col += uAmbient * uAmbientIntensity * 0.035;

    float fogAmt = 1.0 - exp(-uFogDensity * dist);
    col = mix(col, uFog, clamp(fogAmt, 0.0, 1.0));

    col += (hash21(gl_FragCoord.xy) - 0.5) * 0.004;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export default function Sand({ palette, segments = [140, 200] }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uDry: { value: new THREE.Color() },
          uWet: { value: new THREE.Color() },
          uFoam: { value: new THREE.Color() },
          uFog: { value: new THREE.Color() },
          uLight: { value: new THREE.Color() },
          uAmbient: { value: new THREE.Color() },
          uSunDir: { value: new THREE.Vector3() },
          uCamera: { value: new THREE.Vector3() },
          uLightIntensity: { value: 1 },
          uAmbientIntensity: { value: 1 },
          uFogDensity: { value: 0.002 },
          uTime: { value: 0 },
        },
      }),
    []
  );

  const u = material.uniforms;
  u.uDry.value.copy(palette.sandDry);
  u.uWet.value.copy(palette.sandWet);
  u.uFoam.value.copy(palette.foam);
  u.uFog.value.copy(palette.fog);
  u.uLight.value.copy(palette.light);
  u.uAmbient.value.copy(palette.ambient);
  u.uSunDir.value.copy(palette.sunDir);
  u.uLightIntensity.value = palette.lightIntensity;
  u.uAmbientIntensity.value = palette.ambientIntensity;
  u.uFogDensity.value = palette.fogDensity;

  useFrame((state) => {
    u.uTime.value = state.clock.elapsedTime;
    u.uCamera.value.copy(state.camera.position);
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 50]}
      material={material}
      frustumCulled={false}
    >
      <planeGeometry args={[1400, 900, segments[0], segments[1]]} />
    </mesh>
  );
}
