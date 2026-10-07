import { useRef } from "react";
import { profile, timeline } from "../data/content";
import { useTimelineFrame } from "../lib/useTimelineFrame";
import { scrollToProgress } from "../lib/useScrollDriver";

/* ------------------------------------------------------------ mode switch */

export function ModeSwitch({ mode, onChange }) {
  const night = mode === "night";
  return (
    <div className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.2em]">
      <span className={night ? "opacity-35" : "opacity-100"}>Day</span>
      <button
        type="button"
        role="switch"
        aria-checked={night}
        aria-label="Night mode"
        onClick={() => onChange(night ? "day" : "night")}
        className="relative h-[14px] w-[34px] cursor-pointer border-0 bg-transparent p-0"
      >
        <span
          className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-current opacity-40"
          aria-hidden="true"
        />
        <span
          className="absolute top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-current transition-[left] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ left: night ? "27px" : "0px" }}
          aria-hidden="true"
        />
      </button>
      <span className={night ? "opacity-100" : "opacity-35"}>Night</span>
    </div>
  );
}

/* ----------------------------------------------------------- sound toggle */

export function SoundToggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[10px] font-medium uppercase tracking-[0.2em] text-inherit"
    >
      <span className="flex h-[11px] items-end gap-[2px]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-[2px] bg-current transition-all duration-500"
            style={{
              height: enabled ? `${[5, 11, 7][i]}px` : "2px",
              opacity: enabled ? 1 : 0.4,
              animation: enabled
                ? `soundbar 1.${6 + i}s ease-in-out ${i * 0.2}s infinite`
                : "none",
            }}
          />
        ))}
      </span>
      <span>{enabled ? "Sound on" : "Sound off"}</span>
    </button>
  );
}

/* -------------------------------------------------------------- side rail */

export function SectionRail() {
  const refs = useRef([]);

  useTimelineFrame(({ progress }) => {
    timeline.forEach((section, i) => {
      const el = refs.current[i];
      if (!el) return;
      const active = progress >= section.start - 0.005 && progress < section.end;
      el.style.opacity = active ? "1" : "0.4";
      const line = el.firstChild;
      if (line) line.style.width = active ? "26px" : "10px";
    });
  });

  return (
    <nav
      aria-label="Journey"
      className="pointer-events-auto fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3.5 md:flex"
    >
      {timeline.map((section, i) => (
        <button
          key={section.id}
          type="button"
          ref={(el) => (refs.current[i] = el)}
          onClick={() => scrollToProgress((section.start + section.end) / 2 - 0.02)}
          className="flex cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-[9.5px] font-medium uppercase tracking-[0.22em] transition-opacity duration-300"
          style={{ opacity: 0.4 }}
        >
          <span
            className="block h-px bg-current transition-all duration-500 ease-out"
            style={{ width: "10px" }}
            aria-hidden="true"
          />
          {section.label}
        </button>
      ))}
    </nav>
  );
}

/* --------------------------------------------- small screens: a thin line */

function MobileProgress() {
  const bar = useRef(null);
  const label = useRef(null);

  useTimelineFrame(({ progress }) => {
    if (bar.current) bar.current.style.transform = `scaleX(${progress.toFixed(4)})`;
    const el = label.current;
    if (!el) return;
    const section =
      timeline.find((s) => progress < s.end) || timeline[timeline.length - 1];
    if (el.textContent !== section.label) el.textContent = section.label;
    el.style.opacity = Math.min(1, Math.max(0, (progress - 0.05) / 0.04)).toFixed(2);
  });

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 md:hidden"
      style={{ color: "var(--ui)" }}
      aria-hidden="true"
    >
      <span
        ref={label}
        className="absolute bottom-5 left-5 text-[9.5px] font-medium uppercase tracking-[0.24em]"
        style={{ opacity: 0 }}
      />
      <div className="h-px w-full bg-current opacity-20" />
      <div
        ref={bar}
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-current"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ chrome */

export default function Chrome({ mode, onMode, sound, onSound, minimal = false }) {
  const hintRef = useRef(null);

  useTimelineFrame(({ progress }) => {
    if (!hintRef.current) return;
    const o = Math.max(0, 1 - progress / 0.045);
    hintRef.current.style.opacity = o.toFixed(3);
    hintRef.current.style.transform = `translateY(${(1 - o) * 10}px)`;
  }, !minimal);

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between px-5 py-5 md:px-8 md:py-7"
        style={{ color: "var(--ui)" }}
      >
        <a
          href="#/"
          className="pointer-events-auto block leading-tight no-underline"
          style={{ color: "inherit" }}
        >
          <span className="block text-[12px] font-medium uppercase tracking-[0.22em]">
            {profile.name}
          </span>
          <span className="mt-1 block text-[9.5px] uppercase tracking-[0.22em] opacity-60">
            {profile.role}
          </span>
        </a>

        <div className="pointer-events-auto flex items-center gap-5 md:gap-7">
          <a
            href="#/resume"
            className="link-rule hidden text-[10px] font-medium uppercase tracking-[0.2em] sm:inline-block"
            style={{ color: "inherit" }}
          >
            Résumé
          </a>
          <ModeSwitch mode={mode} onChange={onMode} />
        </div>
      </header>

      {!minimal && <SectionRail />}
      {!minimal && <MobileProgress />}

      <div
        className="pointer-events-auto fixed bottom-5 right-5 z-30 md:bottom-7 md:right-8"
        style={{ color: "var(--ui)" }}
      >
        <SoundToggle enabled={sound} onToggle={onSound} />
      </div>

      {!minimal && (
        <div
          ref={hintRef}
          className="pointer-events-none fixed bottom-5 left-5 z-30 md:bottom-7 md:left-8"
          style={{ color: "var(--ui)" }}
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] opacity-70">
            Scroll to walk in
          </span>
        </div>
      )}
    </>
  );
}
