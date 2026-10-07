import { useEffect } from "react";
import Lenis from "lenis";
import { setRaw } from "./scrollStore";

// Drives the 0..1 journey timeline from the native scroll position.
// With smooth scrolling (Lenis) on capable setups, plain native scroll when
// motion is reduced.
let activeLenis = null;

export function useScrollDriver({ smooth = true } = {}) {
  useEffect(() => {
    let raf = 0;
    let lenis = null;

    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY || window.pageYOffset || 0;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      setRaw(p, 0);
    };

    if (smooth) {
      lenis = new Lenis({
        lerp: 0.085,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.1,
        smoothWheel: true,
      });
      lenis.on("scroll", ({ progress, velocity }) => {
        setRaw(Math.min(1, Math.max(0, progress)), velocity);
      });
      activeLenis = lenis;
      const loop = (time) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    } else {
      read();
      window.addEventListener("scroll", read, { passive: true });
      window.addEventListener("resize", read);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (lenis) {
        lenis.destroy();
        if (activeLenis === lenis) activeLenis = null;
      }
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [smooth]);
}

// Freeze the journey while a modal (the lens) is open, so the wheel or a swipe
// on the lens never walks the camera in the background.
export function pauseScroll() {
  if (activeLenis) activeLenis.stop();
}

export function resumeScroll() {
  if (activeLenis) activeLenis.start();
}

// Walk the camera to a given 0..1 point on the timeline.
export function scrollToProgress(p) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const top = max * Math.min(1, Math.max(0, p));
  if (activeLenis) {
    activeLenis.scrollTo(top, { duration: 1.8 });
  } else {
    window.scrollTo({ top, behavior: "smooth" });
  }
}
