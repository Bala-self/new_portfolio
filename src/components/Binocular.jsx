import { useEffect, useRef, useState } from "react";
import { profile } from "../data/content";
import { useTimelineFrame } from "../lib/useTimelineFrame";
import { pauseScroll, resumeScroll } from "../lib/useScrollDriver";
import { clamp } from "../lib/scrollStore";

// The exact supplied photograph. The file is shown as-is: no generation, no
// retouching, no filter on the image at rest. The "optics" below are only a
// transform on the <img> and some glass layers drawn on top of it.
const PHOTO_DAY = "/photo/balakrishnan-day.jpg";
const PHOTO_NIGHT = "/photo/balakrishnan-night.jpg";

const PHOTO_ZOOM = 1.05;
const PHOTO_FOCUS = "50% 50%";

const REST_ZOOM = PHOTO_ZOOM; // the lens always magnifies a little
const ENGAGED_ZOOM = 0.15; // extra, while hovering or touching the glass
const MAX_ZOOM = 2.0;

/* ------------------------------------------------------------------ lens */

function OpticalLens({ mode, failed, onFail, focusTarget }) {
  const lens = useRef(null);
  const img = useRef(null);
  const glint = useRef(null);
  const rim = useRef(null);

  const photoSrc = mode === "night" ? PHOTO_NIGHT : PHOTO_DAY;

  useEffect(() => {
    if (focusTarget) focusTarget.current = lens.current;
  }, [focusTarget]);

  // where the lens is looking (target) and where it currently is (now)
  const target = useRef({ x: 0.5, y: 0.5, zoom: REST_ZOOM });
  const now = useRef({ x: 0.5, y: 0.5, zoom: 1 });
  const base = useRef(REST_ZOOM);
  const engaged = useRef(false);

  const retarget = () => {
    target.current.zoom = clamp(
      base.current + (engaged.current ? ENGAGED_ZOOM : 0),
      1,
      MAX_ZOOM
    );
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();

    const tick = (time) => {
      const dt = Math.min((time - last) / 1000, 0.05);
      last = time;
      // frame-rate independent easing; instant when motion is reduced
      const k = reduced ? 1 : 1 - Math.exp(-7 * dt);
      const c = now.current;
      const t = target.current;
      c.x += (t.x - c.x) * k;
      c.y += (t.y - c.y) * k;
      c.zoom += (t.zoom - c.zoom) * k;

      if (img.current) {
        img.current.style.transformOrigin = `${(c.x * 100).toFixed(2)}% ${(c.y * 100).toFixed(2)}%`;
        img.current.style.transform = `scale(${c.zoom.toFixed(4)})`;
      }
      // the reflections stay put on the glass while the picture moves under
      // them: only a very small parallax, like light on a curved surface
      if (glint.current) {
        glint.current.style.transform = `translate3d(${((0.5 - c.x) * 16).toFixed(2)}px, ${((0.5 - c.y) * 10).toFixed(2)}px, 0) rotate(-32deg)`;
      }
      if (rim.current) {
        rim.current.style.transform = `translate3d(${((0.5 - c.x) * 5).toFixed(2)}px, ${((0.5 - c.y) * 5).toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const aim = (e) => {
    const r = lens.current.getBoundingClientRect();
    target.current.x = clamp((e.clientX - r.left) / r.width);
    target.current.y = clamp((e.clientY - r.top) / r.height);
  };

  const onPointerEnter = (e) => {
    if (e.pointerType !== "mouse") return;
    engaged.current = true;
    aim(e);
    retarget();
  };

  const onPointerMove = (e) => {
    if (e.pointerType === "mouse" || engaged.current) aim(e);
  };

  const onPointerLeave = (e) => {
    if (e.pointerType !== "mouse") return;
    engaged.current = false;
    target.current.x = 0.5;
    target.current.y = 0.5;
    retarget();
  };

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse") return;
    lens.current.setPointerCapture?.(e.pointerId);
    engaged.current = true;
    aim(e);
    retarget();
  };

  const onPointerUp = (e) => {
    if (e.pointerType === "mouse") return;
    engaged.current = false;
    retarget();
  };

  const onKeyDown = (e) => {
    const step = 0.06;
    const t = target.current;
    switch (e.key) {
      case "ArrowLeft":
        t.x = clamp(t.x - step);
        break;
      case "ArrowRight":
        t.x = clamp(t.x + step);
        break;
      case "ArrowUp":
        t.y = clamp(t.y - step);
        break;
      case "ArrowDown":
        t.y = clamp(t.y + step);
        break;
      case "+":
      case "=":
        base.current = clamp(base.current + 0.08, 1, MAX_ZOOM);
        retarget();
        break;
      case "-":
      case "_":
        base.current = clamp(base.current - 0.08, 1, MAX_ZOOM);
        retarget();
        break;
      case "0":
      case "Home":
        base.current = REST_ZOOM;
        t.x = 0.5;
        t.y = 0.5;
        retarget();
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  return (
    <div
      ref={lens}
      tabIndex={0}
      role="group"
      aria-label="Optical lens. Arrow keys move the lens, plus and minus change the magnification, zero resets."
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className="relative h-full w-full cursor-zoom-in touch-none outline-offset-[10px]"
      style={{ isolation: "isolate" }}
    >
      {/* the photograph, full screen view without circular masks or vignetting */}
      <div
        className="absolute inset-0 bg-transparent flex items-center justify-center"
        style={{ animation: "focusPull 0.8s ease-out backwards" }}
      >
        {!failed ? (
          <img
            ref={img}
            src={photoSrc}
            alt={`${profile.name}, ${profile.role}, ${profile.shortLocation}`}
            onError={onFail}
            draggable={false}
            decoding="async"
            className="h-full w-full select-none object-contain rounded-lg"
            style={{ objectPosition: PHOTO_FOCUS, willChange: "transform" }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-center">
            <span className="t-display text-[clamp(2rem,7vmin,3.6rem)]">BM</span>
            <span className="mt-3 max-w-[60%] text-[10px] uppercase leading-relaxed tracking-[0.2em] opacity-60">
              Add the photograph at public/photo/balakrishnan.jpg
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- viewer */

export default function Binocular({ mode }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const cueRef = useRef(null);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const lensRef = useRef(null);

  useTimelineFrame(({ progress }) => {
    const el = cueRef.current;
    if (!el) return;
    const t = Math.min(1, Math.max(0, (progress - 0.892) / 0.05));
    el.style.opacity = t.toFixed(3);
    el.style.transform = `translate3d(-50%, ${(1 - t) * 24}px, 0)`;
    el.style.visibility = t <= 0.01 ? "hidden" : "visible";
    el.style.pointerEvents = t > 0.6 ? "auto" : "none";
  });

  // fetch both day and night photographs quietly ahead of time
  useEffect(() => {
    const id = setTimeout(() => {
      const preloadDay = new Image();
      preloadDay.decoding = "async";
      preloadDay.src = PHOTO_DAY;
      const preloadNight = new Image();
      preloadNight.decoding = "async";
      preloadNight.src = PHOTO_NIGHT;
    }, 2500);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    pauseScroll();
    // focus the viewer, so the arrow keys work the moment it opens
    const id = setTimeout(() => {
      (lensRef.current || closeRef.current)?.focus();
    }, 80);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      resumeScroll();
      clearTimeout(id);
      triggerRef.current?.focus();
    };
  }, [open]);

  // keep Tab inside the open viewer
  const onDialogKeyDown = (e) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = dialogRef.current.querySelectorAll('button, [tabindex="0"]');
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const scrim = mode === "night" ? "rgba(2,6,10,0.96)" : "rgba(8,22,30,0.92)";

  return (
    <>
      <div
        ref={cueRef}
        className="fixed bottom-[14vh] left-1/2 z-30 flex flex-col items-center"
        style={{ color: "var(--ui)", opacity: 0, visibility: "hidden" }}
      >
        <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.26em] opacity-70">
          One last look
        </p>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="group flex cursor-pointer flex-col items-center gap-3"
          aria-haspopup="dialog"
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full border border-current transition-transform duration-500 group-hover:scale-[1.07]"
            aria-hidden="true"
          >
            <span className="block h-2.5 w-2.5 rounded-full bg-current" />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em]">
            View
          </span>
        </button>
      </div>

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Photograph of ${profile.name}`}
          aria-describedby="lens-help"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 py-8"
          style={{ background: scrim, color: "#eef2f3" }}
          onKeyDown={onDialogKeyDown}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* Full Screen Image Frame Container */}
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-xl"
            style={{
              width: "min(95vw, 1100px)",
              height: "min(82vh, 720px)",
              animation: "eyeOpen 0.8s cubic-bezier(0.16, 0.84, 0.28, 1) both",
              boxShadow: "0 24px 80px rgba(0,0,0,0.75)",
            }}
          >
            <OpticalLens
              mode={mode}
              failed={failed}
              onFail={() => setFailed(true)}
              focusTarget={lensRef}
            />
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 px-6 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em]">
              {profile.name}
              <span className="mx-3 opacity-40">·</span>
              {profile.shortLocation}
            </p>
            <p
              id="lens-help"
              className="max-w-[28rem] text-[10px] uppercase leading-relaxed tracking-[0.2em] opacity-45"
            >
              Hover or touch to pan view
              <span className="mx-2 hidden sm:inline">·</span>
              <span className="hidden sm:inline">
                Arrow keys move, + / − magnify
              </span>
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="link-rule cursor-pointer text-[10px] font-medium uppercase tracking-[0.26em] opacity-75 mt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
