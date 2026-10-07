import { useCallback, useEffect, useRef, useState } from "react";

// Drop the supplied beach recording at public/audio/beach.mp3 and it is used
// as-is. Until that file exists, a quiet procedural surf bed stands in so the
// control is never dead — no music either way.
const SOURCE = "/audio/beach.mp3";
const STORAGE_KEY = "bm.sound";

function buildSurf(ctx, destination) {
  const seconds = 8;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.028 * white) / 1.028; // brown-ish noise, the sea's body
    data[i] = last * 3.2;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const body = ctx.createBiquadFilter();
  body.type = "lowpass";
  body.frequency.value = 520;

  const bodyGain = ctx.createGain();
  bodyGain.gain.value = 0.9;

  const wash = ctx.createBiquadFilter();
  wash.type = "bandpass";
  wash.frequency.value = 1700;
  wash.Q.value = 0.6;

  const washGain = ctx.createGain();
  washGain.gain.value = 0.12;

  // slow swell: waves arriving roughly every 9 and 14 seconds
  const lfoA = ctx.createOscillator();
  lfoA.frequency.value = 1 / 9;
  const lfoAGain = ctx.createGain();
  lfoAGain.gain.value = 0.09;
  lfoA.connect(lfoAGain).connect(washGain.gain);

  const lfoB = ctx.createOscillator();
  lfoB.frequency.value = 1 / 14.5;
  const lfoBGain = ctx.createGain();
  lfoBGain.gain.value = 0.3;
  lfoB.connect(lfoBGain).connect(bodyGain.gain);

  source.connect(body).connect(bodyGain).connect(destination);
  source.connect(wash).connect(washGain).connect(destination);

  source.start();
  lfoA.start();
  lfoB.start();

  return () => {
    try {
      source.stop();
      lfoA.stop();
      lfoB.stop();
    } catch (e) {
      /* already stopped */
    }
  };
}

export function useAmbientAudio() {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(true);
  const ref = useRef({ ctx: null, gain: null, stop: null });

  const start = useCallback(async () => {
    const store = ref.current;
    if (store.ctx) {
      await store.ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      setAvailable(false);
      return;
    }
    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    store.ctx = ctx;
    store.gain = gain;

    let usedFile = false;
    try {
      const res = await fetch(SOURCE);
      if (res.ok) {
        const type = res.headers.get("content-type") || "";
        if (type.includes("audio") || type.includes("octet-stream")) {
          const buf = await ctx.decodeAudioData(await res.arrayBuffer());
          const node = ctx.createBufferSource();
          node.buffer = buf;
          node.loop = true;
          node.connect(gain);
          node.start();
          store.stop = () => {
            try {
              node.stop();
            } catch (e) {
              /* noop */
            }
          };
          usedFile = true;
        }
      }
    } catch (e) {
      usedFile = false;
    }

    if (!usedFile) store.stop = buildSurf(ctx, gain);

    await ctx.resume();
  }, []);

  const fade = useCallback((to, time = 1.2) => {
    const { ctx, gain } = ref.current;
    if (!ctx || !gain) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(to, now + time);
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch (e) {
      /* storage blocked */
    }
    if (next) {
      await start();
      fade(0.32, 2.2);
    } else {
      fade(0, 0.6);
      setTimeout(() => {
        const { ctx } = ref.current;
        if (ctx && ctx.state === "running") ctx.suspend();
      }, 700);
    }
  }, [enabled, start, fade]);

  // pause when the tab is hidden
  useEffect(() => {
    const onVisible = () => {
      const { ctx } = ref.current;
      if (!ctx) return;
      if (document.hidden) ctx.suspend();
      else if (enabled) ctx.resume();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled]);

  useEffect(
    () => () => {
      const { ctx, stop } = ref.current;
      if (stop) stop();
      if (ctx) ctx.close();
    },
    []
  );

  return { enabled, available, toggle };
}
