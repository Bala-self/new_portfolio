import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { NOISE_GLSL } from "./env";

const vertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec3 vDir;

  uniform vec3 uZenith;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uCloud;
  uniform vec3 uCloudShade;
  uniform vec3 uLight;
  uniform vec3 uSunDir;
  uniform float uCloudAmount;
  uniform float uStars;
  uniform float uTime;
  uniform int uOctaves;

  ${NOISE_GLSL}

  // A separate hash for the star field: the shared one above loses entropy at
  // the large cell coordinates a fine star grid produces.
  float starHash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec3 dir = normalize(vDir);
    float h = dir.y;

    // vertical gradient of the sky
    vec3 col = mix(uHorizon, uMid, smoothstep(-0.01, 0.26, h));
    col = mix(col, uZenith, smoothstep(0.18, 0.92, h));

    float sd = max(dot(dir, uSunDir), 0.0);

    // soft light bloom around the sun / moon direction
    col += uLight * pow(sd, 7.0) * 0.14 * (1.0 - uStars);
    col += uLight * pow(sd, 48.0) * 0.30;

    // night: the moon itself, its halo, and the stars
    if (uStars > 0.5) {
      // the disc is about 0.7 degrees across, close to the real moon
      float moon = smoothstep(0.99990, 0.99995, sd);
      float halo = pow(sd, 1500.0) * 0.55 + pow(sd, 150.0) * 0.07;
      col += uLight * (moon * 1.6 + halo);

      // Stars. A stable direction field, so they never crawl as the camera
      // moves. Cells are about 0.6 degrees across, which keeps each star near
      // a pixel and avoids aliasing, and they thin out toward the horizon.
      vec2 sc = vec2(atan(dir.z, dir.x), asin(clamp(h, -1.0, 1.0))) * 90.0;
      vec2 cell = floor(sc);
      float rnd = starHash(cell);
      if (rnd > 0.962) {
        vec2 off = vec2(starHash(cell + 3.1), starHash(cell + 7.7));
        float d = length(fract(sc) - off);
        // roughly one in a dozen of these is a noticeably brighter star
        float big = step(0.991, rnd);
        float radius = 0.10 + big * 0.20;
        float star = smoothstep(radius, 0.0, d);
        float twinkle = 0.62 + 0.38 * sin(uTime * (0.7 + rnd * 3.0) + rnd * 40.0);
        vec3 tint = mix(vec3(0.80, 0.86, 0.97), vec3(0.95, 0.90, 0.99), big);
        col += tint * star * twinkle *
               smoothstep(0.015, 0.32, h) * (0.72 + big * 0.55);
      }
    }

    // cloud layer, projected onto a flat plane above the sea
    if (h > 0.0) {
      vec2 p = dir.xz / max(h, 0.055);
      vec2 uv = p * 0.055 + vec2(uTime * 0.0045, uTime * 0.0016);
      float f = fbm(uv, uOctaves);
      float f2 = fbm(uv * 2.3 + 11.0, uOctaves - 1);
      float cover = smoothstep(0.50, 0.83, f) * uCloudAmount;
      cover *= smoothstep(0.0, 0.16, h);          // no clouds glued to the horizon
      cover *= 1.0 - smoothstep(60.0, 190.0, length(p)); // fade into the distance
      vec3 cloudCol = mix(uCloudShade, uCloud, smoothstep(0.35, 0.8, f2));
      cloudCol += uLight * pow(sd, 10.0) * 0.12;
      col = mix(col, cloudCol, clamp(cover, 0.0, 1.0));
    }

    // tiny dither keeps the gradient free of banding
    col += (hash21(gl_FragCoord.xy) - 0.5) * 0.0045;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export default function SkyDome({ palette, octaves = 4 }) {
  const matRef = useRef();

  const uniforms = useMemo(
    () => ({
      uZenith: { value: palette.skyZenith.clone() },
      uMid: { value: palette.skyMid.clone() },
      uHorizon: { value: palette.skyHorizon.clone() },
      uCloud: { value: palette.cloud.clone() },
      uCloudShade: { value: palette.cloudShade.clone() },
      uLight: { value: palette.light.clone() },
      uSunDir: { value: palette.sunDir.clone() },
      uCloudAmount: { value: palette.cloudAmount },
      uStars: { value: palette.starAmount },
      uTime: { value: 0 },
      uOctaves: { value: octaves },
    }),
    [octaves]
  );

  useEffect(() => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uZenith.value.copy(palette.skyZenith);
    u.uMid.value.copy(palette.skyMid);
    u.uHorizon.value.copy(palette.skyHorizon);
    u.uCloud.value.copy(palette.cloud);
    u.uCloudShade.value.copy(palette.cloudShade);
    u.uLight.value.copy(palette.light);
    u.uSunDir.value.copy(palette.sunDir);
    u.uCloudAmount.value = palette.cloudAmount;
    u.uStars.value = palette.starAmount;
  }, [palette]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });


  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[1400, 48, 32]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}
