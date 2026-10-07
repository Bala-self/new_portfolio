import { useEffect, useRef } from "react";
import { getScroll } from "./scrollStore";

/**
 * Run a callback on every animation frame with the current scroll state.
 * Used by the DOM layers so they can be driven by the same timeline as the
 * camera without re-rendering React.
 */
export function useTimelineFrame(callback, active = true) {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(() => {
    if (!active) return undefined;
    let raf = 0;
    const loop = () => {
      ref.current(getScroll());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
