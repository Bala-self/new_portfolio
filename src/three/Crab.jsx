import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { sandHeight } from "./env";
import { clamp, damp } from "../lib/scrollStore";
import CrabFallback from "./CrabFallback";

// The supplied model. Used as-is; nothing about it is regenerated.
const CRAB_URL =
  "https://raw.githubusercontent.com/Bala-self/game-video/main/crab.glb";

// The crab keeps to a patch of dry sand just ahead of where the walker starts,
// so it is in shot for the opening of the journey. Once the walker gets close
// it notices and scurries off, and a new one turns up elsewhere later.
const PATCH = { x: 3, zNear: 5.5, zFar: 9 };
const CLOSE = 4.5; // how near the walker gets before the crab bolts
const SCALE = 0.55;

// The supplied model is rescaled into the same footprint as the fallback crab,
// so swapping between the two never changes how it sits on the sand.
const TARGET_SPAN = 0.8; // widest of x / z
const TARGET_BASE = -0.084; // where the feet sit under the group origin
const MODEL_YAW = 0; // nudge this if the model does not face +Z

const rand = (a, b) => a + Math.random() * (b - a);

const awayVec = new THREE.Vector3();
const fwdVec = new THREE.Vector3();
const sideVec = new THREE.Vector3();

function dampAngle(cur, target, lambda, dt) {
  let d = target - cur;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return cur + d * (1 - Math.exp(-lambda * dt));
}

/** A soft radial blob, used as a contact shade so the crab sits on the sand. */
function shadeTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  g.addColorStop(0, "rgba(0,0,0,0.55)");
  g.addColorStop(0.55, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/**
 * Loads the supplied crab.glb after mount, so it never blocks the first paint.
 * If the file is missing, blocked or in a format this loader cannot read, the
 * status falls back and the procedural crab is shown instead.
 */
function useCrabModel(url) {
  const [state, setState] = useState({ status: "loading", gltf: null, mixer: null });

  useEffect(() => {
    let alive = true;
    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        if (!alive) return;

        const model = gltf.scene;
        model.updateWorldMatrix(true, true);

        // fit it to the same footprint as the fallback crab
        let box = new THREE.Box3().setFromObject(model);
        const span = Math.max(
          box.max.x - box.min.x,
          box.max.z - box.min.z,
          1e-4
        );
        model.scale.setScalar(TARGET_SPAN / span);

        model.updateWorldMatrix(true, true);
        box = new THREE.Box3().setFromObject(model);
        const centre = box.getCenter(new THREE.Vector3());
        model.position.x -= centre.x;
        model.position.z -= centre.z;
        model.position.y = TARGET_BASE - box.min.y;
        model.rotation.y = MODEL_YAW;

        // remember each material's own emissive so night can be undone again
        const baseEmissive = [];
        model.traverse((o) => {
          if (!o.isMesh || !o.material) return;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            if (m.emissive) baseEmissive.push([m, m.emissive.clone()]);
          });
        });
        model.userData.baseEmissive = baseEmissive;

        setState({
          status: "ready",
          gltf,
          mixer: new THREE.AnimationMixer(model),
        });
      },
      undefined,
      () => {
        if (alive) setState({ status: "failed", gltf: null, mixer: null });
      }
    );

    return () => {
      alive = false;
    };
  }, [url]);

  return state;
}

export default function Crab({ mode }) {
  const root = useRef();
  const body = useRef();
  const legs = useRef([]);
  const claws = useRef([]);
  const { camera, gl, size } = useThree();

  const night = mode === "night";
  const { gltf, mixer } = useCrabModel(CRAB_URL);
  const hasModel = Boolean(gltf);

  const shell = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.58, metalness: 0.04 }),
    []
  );
  const limb = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0.02 }),
    []
  );
  const eye = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1 }),
    []
  );
  const shade = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }),
    []
  );
  const shadeMap = useMemo(shadeTexture, []);

  shell.color.set(night ? "#5d3324" : "#b25730");
  shell.emissive.set(night ? "#2c1108" : "#000000");
  limb.color.set(night ? "#4a2a1e" : "#96441f");
  limb.emissive.set(night ? "#200c06" : "#000000");
  eye.color.set(night ? "#0c1216" : "#12181c");
  shade.map = shadeMap;
  shade.opacity = night ? 0.45 : 0.65;

  // play the model's first animation clip, and speed it up as it scuttles
  const actionRef = useRef(null);
  useEffect(() => {
    if (!gltf || !mixer || !gltf.animations || !gltf.animations.length) {
      return undefined;
    }
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
    actionRef.current = action;
    return () => {
      action.stop();
      actionRef.current = null;
    };
  }, [gltf, mixer]);

  useEffect(() => () => mixer && mixer.stopAllAction(), [mixer]);

  // at night the supplied model is only lit by moonlight, so give it back a
  // little of its own emissive to stay findable. Day restores the original.
  useEffect(() => {
    if (!gltf) return undefined;
    const base = gltf.scene.userData.baseEmissive || [];
    base.forEach(([m, original]) => {
      if (night) m.emissive.set("#3a1c0c");
      else m.emissive.copy(original);
    });
    return undefined;
  }, [gltf, night]);

  const state = useRef({
    x: 2.4,
    z: 8,
    tx: 2.4,
    tz: 8,
    heading: 0.7,
    speed: 0,
    wait: 1.4,
    phase: 0,
    mode: "wander", // wander | flee | hidden
    flee: 0,
    respawn: 0,
    startX: 0,
    startZ: 0,
    noticed: false,
  });

  // Half the horizontal field of view, so the crab can be kept in frame on any
  // screen shape without a special case per device. The vertical fov mirrors
  // the rule in CameraRig, which is applied during its own frame — reading it
  // straight off the camera here would be one frame stale on a tall screen.
  const halfWidth = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const vFov = ((aspect < 0.95 ? 56 : 44) * Math.PI) / 180;
    return Math.atan(Math.tan(vFov / 2) * aspect);
  }, [size.width, size.height]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = state.current;
    const g = root.current;
    if (!g) return;

    const camX = camera.position.x;
    const camZ = camera.position.z;

    if (s.mode === "hidden") {
      g.visible = false;
      s.respawn -= dt;
      if (s.respawn <= 0) {
        // only come back somewhere the walker is not standing
        const x = rand(-PATCH.x, PATCH.x);
        const z = rand(PATCH.zNear, PATCH.zFar);
        if (Math.hypot(x - camX, z - camZ) > CLOSE + 1) {
          s.mode = "wander";
          s.x = x;
          s.z = z;
          s.tx = x;
          s.tz = z;
          s.heading = rand(-Math.PI, Math.PI);
          s.wait = rand(0.8, 2.4);
          s.noticed = false;
          g.visible = true;
        } else {
          s.respawn = 0.6;
        }
      }
      return;
    }

    if (s.mode === "flee") {
      s.flee -= dt;
      s.speed = damp(s.speed, 8.5, 4, dt);
      if (s.flee <= 0 || Math.hypot(s.x - s.startX, s.z - s.startZ) > 46) {
        s.mode = "hidden";
        s.respawn = rand(5, 9);
        s.speed = 0;
        return;
      }
    } else {
      // the walker is coming: take off before they arrive
      if (!s.noticed && Math.hypot(s.x - camX, s.z - camZ) < CLOSE) {
        s.noticed = true;
        s.mode = "flee";
        s.flee = 3.4;
        s.startX = s.x;
        s.startZ = s.z;
        s.heading = rand(-Math.PI, Math.PI);
      } else {
        s.wait -= dt;
        if (s.wait <= 0) {
          if (Math.hypot(s.x - s.tx, s.z - s.tz) < 0.45) {
            s.tx = rand(-PATCH.x, PATCH.x);
            s.tz = rand(PATCH.zNear, PATCH.zFar);
            s.wait = rand(1.6, 4.6);
            s.speed = damp(s.speed, 0, 4, dt);
          } else {
            s.speed = damp(s.speed, 0.42, 3, dt);
          }
        } else {
          s.speed = damp(s.speed, 0, 4, dt);
        }
        s.heading = dampAngle(
          s.heading,
          Math.atan2(s.tx - s.x, s.tz - s.z),
          2.4,
          dt
        );
      }
    }

    s.x += Math.sin(s.heading) * s.speed * dt;
    s.z += Math.cos(s.heading) * s.speed * dt;

    // keep it on its patch of sand, and inside the frame on any screen shape
    s.z = clamp(s.z, PATCH.zNear, PATCH.zFar);
    const depth = Math.max(2, camZ - s.z);
    const reach = depth * Math.tan(halfWidth) * 0.82;
    s.x = clamp(s.x, -reach, reach);

    s.phase += dt * (1.6 + s.speed * 5.5);

    g.position.set(s.x, sandHeight(s.z) + 0.14, s.z);
    g.rotation.y = s.heading;

    if (mixer) mixer.update(dt);
    if (actionRef.current) {
      // the clip plays at its own rate while walking, and races when fleeing
      actionRef.current.timeScale = clamp(0.3 + s.speed * 1.6, 0.3, 6);
    }

    // The supplied model animates itself. The fallback has no clips, so it is
    // walked by hand: the shell rides the step and the legs swing.
    if (!hasModel) {
      const stride = clamp(s.speed / 1.1, 0, 1);
      if (body.current) {
        body.current.position.y =
          0.2 + Math.abs(Math.sin(s.phase)) * 0.022 * stride;
        body.current.rotation.z = Math.sin(s.phase) * 0.05 * stride;
        body.current.rotation.x = Math.sin(s.phase * 0.5) * 0.03 * stride;
      }
      for (let i = 0; i < legs.current.length; i++) {
        const leg = legs.current[i];
        if (leg) leg.rotation.y = Math.sin(s.phase + i * 1.05) * 0.4 * stride;
      }
      for (let i = 0; i < claws.current.length; i++) {
        const claw = claws.current[i];
        if (!claw) continue;
        claw.rotation.y = Math.sin(s.phase * 0.5 + i * Math.PI) * 0.14;
        claw.rotation.x = -0.12 + Math.sin(s.phase + i) * 0.06;
      }
    }
  });

  // Clicking the crab startles it and it scuttles out of frame. The canvas is
  // pointer-events:none, so this listens on the window and raycasts by hand.
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const onPointerDown = (event) => {
      const s = state.current;
      if (s.mode === "hidden") return;

      // never steal a click that belongs to the interface or the papers
      const t = event.target;
      if (
        t &&
        t.closest &&
        t.closest("a, button, [role='switch'], [role='dialog'], .sheet")
      ) {
        return;
      }

      const rect = gl.domElement.getBoundingClientRect();
      ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);

      if (!root.current || !ray.intersectObject(root.current, true).length) {
        return;
      }

      // run outward and to one side, so it leaves the frame rather than
      // simply backing away
      camera.getWorldDirection(fwdVec);
      fwdVec.y = 0;
      if (fwdVec.lengthSq() < 1e-6) fwdVec.set(0, 0, -1);
      fwdVec.normalize();
      sideVec.set(1, 0, 0).applyQuaternion(camera.quaternion);
      sideVec.y = 0;
      sideVec.normalize();

      const turn = Math.random() < 0.5 ? -1 : 1;
      awayVec
        .copy(sideVec)
        .multiplyScalar(turn * rand(0.9, 1.5))
        .addScaledVector(fwdVec, 0.5)
        .normalize();

      s.heading = Math.atan2(awayVec.x, awayVec.z);
      s.mode = "flee";
      s.flee = 3.4;
      s.startX = s.x;
      s.startZ = s.z;
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [camera, gl]);

  return (
    <group ref={root} scale={SCALE}>
      {/* contact shade */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.5, 1.9, 1]}
        material={shade}
      >
        <circleGeometry args={[0.5, 24]} />
      </mesh>

      <group ref={body}>
        {hasModel ? (
          <primitive object={gltf.scene} />
        ) : (
          <CrabFallback
            shell={shell}
            limb={limb}
            eye={eye}
            legs={legs}
            claws={claws}
          />
        )}
      </group>
    </group>
  );
}
