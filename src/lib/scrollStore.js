// A tiny frame-rate friendly store. Scroll progress is written here once per
// frame and read directly by the 3D scene and by the DOM layers, so scrolling
// never triggers a React re-render.

const state = {
  progress: 0, // raw 0..1 from the scroll spacer
  smooth: 0, // damped 0..1 used by the camera
  velocity: 0,
};

const listeners = new Set();

export function setRaw(progress, velocity) {
  state.progress = progress;
  state.velocity = velocity;
  for (const fn of listeners) fn(state);
}

export function setSmooth(value) {
  state.smooth = value;
}

export function getScroll() {
  return state;
}

export function subscribeScroll(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

// ---- small math helpers shared across the experience ----

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const lerp = (a, b, t) => a + (b - a) * t;

// frame-rate independent damping
export const damp = (current, target, lambda, dt) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

// 0 at the edges, 1 in the middle of a range — used for content presence
export function windowed(p, start, end, fadeIn = 0.035, fadeOut = 0.035) {
  const inAmt = smoothstep(start - fadeIn * 0.4, start + fadeIn, p);
  const outAmt = 1 - smoothstep(end - fadeOut, end + fadeOut * 0.4, p);
  return clamp(inAmt * outAmt);
}

// local 0..1 position inside a range
export function local(p, start, end) {
  return clamp((p - start) / (end - start));
}
