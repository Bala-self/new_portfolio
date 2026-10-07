import * as THREE from "three";

// ---------------------------------------------------------------------------
// Terrain. One beach profile shared by the CPU and by every shader.
// z > 0  : dry sand rising gently away from the water
// z <= 0 : the sea floor dropping off slowly, so shallow water stays wide
// ---------------------------------------------------------------------------
export function sandHeight(z) {
  if (z > 0) return 0.028 * z;
  return -3.2 * (1 - Math.exp(z / 60));
}

export const SAND_HEIGHT_GLSL = /* glsl */ `
  float sandHeight(float z) {
    if (z > 0.0) return 0.028 * z;
    return -3.2 * (1.0 - exp(z / 60.0));
  }
`;

// Shared value noise / fbm used by sky, sand and foam.
export const NOISE_GLSL = /* glsl */ `
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p, int octaves) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      v += a * vnoise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }
`;

// ---------------------------------------------------------------------------
// Two complete environmental states. No blending between them during scroll.
// ---------------------------------------------------------------------------
export const PALETTES = {
  day: {
    skyZenith: new THREE.Color("#2c76be"),
    skyMid: new THREE.Color("#71b2e0"),
    skyHorizon: new THREE.Color("#d8ebf3"),
    cloud: new THREE.Color("#ffffff"),
    cloudShade: new THREE.Color("#c3d6e3"),
    cloudAmount: 0.52,
    waterDeep: new THREE.Color("#0b6a86"),
    waterMid: new THREE.Color("#1fa0ae"),
    waterShallow: new THREE.Color("#79d8d1"),
    waterEdge: new THREE.Color("#b9ead9"),
    foam: new THREE.Color("#ffffff"),
    sandDry: new THREE.Color("#ece0c7"),
    sandWet: new THREE.Color("#c4b193"),
    fog: new THREE.Color("#cfe4ef"),
    fogDensity: 0.0022,
    light: new THREE.Color("#fff6e4"),
    lightIntensity: 2.5,
    ambient: new THREE.Color("#9fc8e0"),
    ambientIntensity: 1.0,
    // high and behind the walker: no sun in frame, sheets lit from the front
    sunDir: new THREE.Vector3(0.36, 0.72, 0.59).normalize(),
    specPower: 240,
    specStrength: 1.0,
    starAmount: 0.0,
    exposure: 1.0,
    paper: new THREE.Color("#f7f2e6"),
    paperEmissive: new THREE.Color("#000000"),
  },
  night: {
    skyZenith: new THREE.Color("#02060d"),
    skyMid: new THREE.Color("#061320"),
    skyHorizon: new THREE.Color("#0d2433"),
    cloud: new THREE.Color("#16293a"),
    cloudShade: new THREE.Color("#060f18"),
    cloudAmount: 0.3,
    waterDeep: new THREE.Color("#020a11"),
    waterMid: new THREE.Color("#05202c"),
    waterShallow: new THREE.Color("#0b3340"),
    waterEdge: new THREE.Color("#153f49"),
    foam: new THREE.Color("#9fb8c2"),
    sandDry: new THREE.Color("#262d37"),
    sandWet: new THREE.Color("#151b23"),
    fog: new THREE.Color("#091a26"),
    fogDensity: 0.0032,
    light: new THREE.Color("#b9cfe6"),
    lightIntensity: 0.62,
    ambient: new THREE.Color("#2a4258"),
    ambientIntensity: 0.38,
    sunDir: new THREE.Vector3(-0.3, 0.42, -0.86).normalize(),
    specPower: 420,
    specStrength: 1.5,
    starAmount: 1.0,
    exposure: 1.0,
    paper: new THREE.Color("#cfcabc"),
    paperEmissive: new THREE.Color("#8a9099"),
  },
};

// ---------------------------------------------------------------------------
// The journey. One continuous forward path from the dry sand into the sea,
// and a separate, slower path for where the eye is pointed.
// ---------------------------------------------------------------------------

// Eye height 2.34 m on the dry sand, the waterline 14 m ahead: that puts the
// sand in the lower third, a wide band of shallow water above it and the
// horizon at roughly 45% of the frame — the composition of the reference.
export const cameraCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0.0, 2.34, 14),
    new THREE.Vector3(0.5, 2.28, 6),
    new THREE.Vector3(-0.35, 2.18, -3),
    new THREE.Vector3(0.4, 2.04, -16),
    new THREE.Vector3(-0.3, 1.88, -33),
    new THREE.Vector3(0.3, 1.68, -55),
    new THREE.Vector3(-0.15, 1.46, -82),
    new THREE.Vector3(0.0, 1.26, -114),
    new THREE.Vector3(0.0, 1.12, -148),
  ],
  false,
  "catmullrom",
  0.4
);

export const targetCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0.0, 0.45, -40),
    new THREE.Vector3(0.1, 0.38, -50),
    new THREE.Vector3(-0.1, 0.3, -60),
    new THREE.Vector3(0.1, 0.18, -74),
    new THREE.Vector3(-0.05, 0.05, -92),
    new THREE.Vector3(0.05, -0.08, -115),
    new THREE.Vector3(0.0, -0.18, -142),
    new THREE.Vector3(0.0, -0.28, -175),
    new THREE.Vector3(0.0, -0.35, -210),
  ],
  false,
  "catmullrom",
  0.4
);
