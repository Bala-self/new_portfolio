import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { NOISE_GLSL, SAND_HEIGHT_GLSL } from "./env";

const vertex = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uWaves;      // 0 for the distant plane, 1 near the camera
  uniform float uRadius;     // fade the displacement out before the plane edge
  uniform vec2 uCenter;

  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vDepth;

  ${SAND_HEIGHT_GLSL}

  float swell(vec2 p, float t) {
    float h = 0.0;
    h += sin(p.y * 0.52 + t * 1.00) * 0.080;
    h += sin(dot(p, vec2(0.46, 0.33)) * 0.70 + t * 0.81) * 0.052;
    h += sin(dot(p, vec2(-0.52, 0.80)) * 1.05 + t * 1.62) * 0.026;
    h += sin(dot(p, vec2(0.22, 0.96)) * 2.30 + t * 2.45) * 0.011;
    h += sin(dot(p, vec2(0.90, 0.40)) * 3.60 + t * 3.10) * 0.005;
    return h;
  }

  float surface(vec2 p, float t) {
    float depth = max(-sandHeight(p.y), 0.0);
    float shoal = smoothstep(0.0, 1.1, depth);             // flat at the shore
    float edge = 1.0 - smoothstep(uRadius * 0.72, uRadius, length(p - uCenter));
    return swell(p, t) * shoal * edge * uWaves;
  }

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec2 p = world.xz;

    float h = surface(p, uTime);
    world.y += h;

    float e = 0.6;
    float hx = surface(p + vec2(e, 0.0), uTime);
    float hz = surface(p + vec2(0.0, e), uTime);
    vNormal = normalize(vec3(-(hx - h) / e, 1.0, -(hz - h) / e));

    vWorld = world.xyz;
    vDepth = max(-sandHeight(p.y), 0.0);

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uShallow;
  uniform vec3 uEdge;
  uniform vec3 uFoam;
  uniform vec3 uFog;
  uniform vec3 uSkyHorizon;
  uniform vec3 uSkyZenith;
  uniform vec3 uLight;
  uniform vec3 uSunDir;
  uniform vec3 uCamera;
  uniform float uSpecPower;
  uniform float uSpecStrength;
  uniform float uFogDensity;
  uniform float uTime;

  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vDepth;

  ${NOISE_GLSL}

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCamera - vWorld);
    float dist = length(uCamera - vWorld);

    // depth driven body colour: clear turquoise over pale sand, deepening out
    vec3 body = mix(uEdge, uShallow, smoothstep(0.02, 0.55, vDepth));
    body = mix(body, uMid, smoothstep(0.5, 1.7, vDepth));
    body = mix(body, uDeep, smoothstep(1.6, 2.9, vDepth));

    // sky reflection via fresnel
    vec3 R = reflect(-V, N);
    vec3 sky = mix(uSkyHorizon, uSkyZenith, smoothstep(0.0, 0.5, R.y));
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
    vec3 col = mix(body, sky, clamp(fres * 0.82, 0.0, 0.82));

    // specular glitter
    vec3 H = normalize(uSunDir + V);
    float spec = pow(max(dot(N, H), 0.0), uSpecPower) * uSpecStrength;
    col += uLight * spec;

    // surf: a soft band where the sea meets the sand, plus slower swash lines
    float band = smoothstep(0.30, 0.0, vDepth);
    float lines = smoothstep(0.42, 0.95,
      sin(vDepth * 16.0 - uTime * 1.15) * 0.5 + 0.5);
    float grain = fbm(vWorld.xz * 0.8 + vec2(0.0, uTime * 0.35), 3);
    float foam = band * (0.45 + 0.75 * lines) * smoothstep(0.30, 0.72, grain);
    foam += smoothstep(0.055, 0.0, vDepth) * 0.7;
    col = mix(col, uFoam, clamp(foam, 0.0, 0.92));

    // distance haze toward the horizon
    float fogAmt = 1.0 - exp(-uFogDensity * dist);
    col = mix(col, uFog, clamp(fogAmt, 0.0, 1.0));

    col += (hash21(gl_FragCoord.xy + uTime) - 0.5) * 0.004;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function useWaterMaterial(palette, waves, radius) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: { value: 0 },
        uWaves: { value: waves },
        uRadius: { value: radius },
        uCenter: { value: new THREE.Vector2() },
        uCamera: { value: new THREE.Vector3() },
        uDeep: { value: new THREE.Color() },
        uMid: { value: new THREE.Color() },
        uShallow: { value: new THREE.Color() },
        uEdge: { value: new THREE.Color() },
        uFoam: { value: new THREE.Color() },
        uFog: { value: new THREE.Color() },
        uSkyHorizon: { value: new THREE.Color() },
        uSkyZenith: { value: new THREE.Color() },
        uLight: { value: new THREE.Color() },
        uSunDir: { value: new THREE.Vector3() },
        uSpecPower: { value: 240 },
        uSpecStrength: { value: 1 },
        uFogDensity: { value: 0.002 },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const u = material.uniforms;
  u.uDeep.value.copy(palette.waterDeep);
  u.uMid.value.copy(palette.waterMid);
  u.uShallow.value.copy(palette.waterShallow);
  u.uEdge.value.copy(palette.waterEdge);
  u.uFoam.value.copy(palette.foam);
  u.uFog.value.copy(palette.fog);
  u.uSkyHorizon.value.copy(palette.skyHorizon);
  u.uSkyZenith.value.copy(palette.skyZenith);
  u.uLight.value.copy(palette.light);
  u.uSunDir.value.copy(palette.sunDir);
  u.uSpecPower.value = palette.specPower;
  u.uSpecStrength.value = palette.specStrength;
  u.uFogDensity.value = palette.fogDensity;
  u.uWaves.value = waves;
  u.uRadius.value = radius;

  return material;
}

/**
 * Two surfaces: a high resolution patch that follows the camera and carries the
 * actual wave motion, and a cheap far plane that holds the horizon line.
 */
export default function Ocean({ palette, segments = 200, radius = 130 }) {
  const nearRef = useRef();
  const near = useWaterMaterial(palette, 1, radius);
  const far = useWaterMaterial(palette, 0, radius);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cam = state.camera.position;

    // snap to the grid so the waves stay still in world space
    const sx = Math.round(cam.x);
    const sz = Math.round(cam.z);
    // sea level sits 2 cm under the beach profile so the waterline never
    // z-fights with the sand
    if (nearRef.current) nearRef.current.position.set(sx, -0.02, sz);

    near.uniforms.uTime.value = t;
    far.uniforms.uTime.value = t;
    near.uniforms.uCamera.value.copy(cam);
    far.uniforms.uCamera.value.copy(cam);
    near.uniforms.uCenter.value.set(sx, sz);
  });

  return (
    <group>
      <mesh
        ref={nearRef}
        rotation={[-Math.PI / 2, 0, 0]}
        material={near}
        frustumCulled={false}
      >
        <planeGeometry args={[radius * 2, radius * 2, segments, segments]} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, -900]}
        material={far}
        frustumCulled={false}
      >
        <planeGeometry args={[5200, 2600, 80, 40]} />
      </mesh>
    </group>
  );
}
