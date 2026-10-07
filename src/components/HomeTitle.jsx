import { useRef } from "react";
import { profile } from "../data/content";
import { useTimelineFrame } from "../lib/useTimelineFrame";

/**
 * The opening frame. Identity first, environment everywhere else.
 * It leaves the way a person steps forward: up, back, out of focus.
 */
export default function HomeTitle() {
  const wrap = useRef(null);

  useTimelineFrame(({ progress }) => {
    const el = wrap.current;
    if (!el) return;
    const t = Math.min(1, Math.max(0, progress / 0.115));
    const e = t * t;
    el.style.opacity = (1 - e).toFixed(3);
    el.style.transform = `translate3d(0, ${-e * 90}px, 0) scale(${1 - e * 0.06})`;
    el.style.filter = t > 0.6 ? `blur(${(t - 0.6) * 6}px)` : "none";
    el.style.visibility = t >= 1 ? "hidden" : "visible";
  });

  return (
    <div
      ref={wrap}
      className="pointer-events-none fixed inset-x-0 bottom-[16vh] z-20 px-5 md:bottom-[18vh] md:px-8"
      style={{ color: "var(--ui)", willChange: "transform, opacity" }}
      aria-hidden="true"
    >
      <div className="overflow-hidden">
        <h1
          className="t-display rise text-[clamp(2.4rem,8.6vw,7.2rem)]"
          style={{ animationDelay: "0.15s" }}
        >
          Balakrishnan M
        </h1>
      </div>

      <div className="mt-3 overflow-hidden md:mt-4">
        <p
          className="rise text-[clamp(0.72rem,1.5vw,1rem)] font-medium uppercase tracking-[0.34em]"
          style={{ animationDelay: "0.3s" }}
        >
          MERN Stack Developer
        </p>
      </div>

      <div className="mt-6 flex items-center gap-4 overflow-hidden md:mt-7">
        <span
          className="rise h-px w-10 bg-current opacity-40 md:w-16"
          style={{ animationDelay: "0.5s" }}
        />
        <p
          className="rise text-[10px] font-medium uppercase tracking-[0.24em] opacity-70 md:text-[11px]"
          style={{ animationDelay: "0.55s" }}
        >
          {profile.shortLocation}
          <span className="mx-2.5 opacity-50">·</span>
          Available now
        </p>
      </div>
    </div>
  );
}
