import { useEffect, useState } from "react";

function detectWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch (e) {
    return false;
  }
}

function detectTier(width) {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  if (!coarse && width >= 1100 && cores >= 8 && memory >= 8) return "high";
  if (width < 700 || cores <= 4 || memory <= 3) return "low";
  return "mid";
}

/** One read of what this device can reasonably be asked to render. */
export function useCapabilities() {
  const [caps, setCaps] = useState(() => {
    if (typeof window === "undefined") {
      return { ready: false, webgl: false, reducedMotion: true, tier: "low", compact: true };
    }
    const width = window.innerWidth;
    return {
      ready: true,
      webgl: detectWebGL(),
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      tier: detectTier(width),
      compact: width < 860,
    };
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const read = () => {
      const width = window.innerWidth;
      setCaps({
        ready: true,
        webgl: detectWebGL(),
        reducedMotion: mq.matches,
        tier: detectTier(width),
        compact: width < 860,
      });
    };

    read();
    mq.addEventListener("change", read);

    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(read, 220);
    };
    window.addEventListener("resize", onResize);

    return () => {
      mq.removeEventListener("change", read);
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, []);

  return caps;
}
