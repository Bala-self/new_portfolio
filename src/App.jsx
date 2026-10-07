import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Chrome from "./components/Chrome";
import HomeTitle from "./components/HomeTitle";
import Binocular from "./components/Binocular";
import StaticPortfolio from "./components/StaticPortfolio";
import { CaseStudy, ResumePage } from "./components/Pages";
import { useCapabilities } from "./lib/useCapabilities";
import { useAmbientAudio } from "./lib/useAmbientAudio";
import { useScrollDriver } from "./lib/useScrollDriver";
import { useHashRoute, navigate } from "./lib/useHashRoute";

// the heavy part of the site is only fetched once we know it can be rendered
const Experience = lazy(() => import("./three/Experience"));

const MODE_KEY = "bm.mode";
const JOURNEY_HEIGHT = "1000vh";

function readMode() {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    if (saved === "day" || saved === "night") return saved;
  } catch (e) {
    /* storage blocked */
  }
  return "day";
}

let savedHomeScroll = 0;

function SkipLink() {
  return (
    <a className="skip-link" href="#main">
      Skip to content
    </a>
  );
}

export default function App() {
  const caps = useCapabilities();
  const route = useHashRoute();
  const [mode, setMode] = useState(readMode);
  const audio = useAmbientAudio();
  const curtain = useRef(null);

  const isHome = route === "/";
  const immersive = isHome && caps.ready && caps.webgl && !caps.reducedMotion;

  useScrollDriver({ smooth: immersive });

  // ensure page refresh always resets to the starting stage of beach view
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // the two modes are complete states — applied to the document, not blended
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    document.body.style.background = mode === "night" ? "#061018" : "#cfe4ef";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mode === "night" ? "#061018" : "#7fb9e3");
  }, [mode]);

  const changeMode = (next) => {
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch (e) {
      /* storage blocked */
    }
  };

  // keep the document title honest as the hash route changes
  useEffect(() => {
    const base = "Balakrishnan M — MERN Stack Developer, Chennai";
    if (route === "/resume") document.title = `Résumé — ${base}`;
    else if (route.startsWith("/work/")) {
      const slug = route.replace("/work/", "");
      const name = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      document.title = `${name} — Case study — ${base}`;
    } else document.title = base;
  }, [route]);

  // keep the walker's place on the beach when visiting a case study
  useEffect(() => {
    if (!isHome) return undefined;
    const restore = savedHomeScroll;
    if (restore > 0) window.scrollTo(0, restore);
    const remember = () => {
      savedHomeScroll = window.scrollY;
    };
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, [isHome]);

  // fade the first frame in once the scene is mounted
  useEffect(() => {
    if (!immersive || !curtain.current) return undefined;
    const el = curtain.current;
    const id = setTimeout(() => {
      el.style.opacity = "0";
    }, 420);
    return () => clearTimeout(id);
  }, [immersive]);

  if (route.startsWith("/work/")) {
    return (
      <>
        <SkipLink />
        <main id="main">
          <CaseStudy slug={route.replace("/work/", "")} mode={mode} />
        </main>
      </>
    );
  }

  if (route === "/resume") {
    return (
      <>
        <SkipLink />
        <main id="main">
          <ResumePage mode={mode} />
        </main>
      </>
    );
  }

  // ---- home, without the journey: a plain, readable, complete page --------
  if (!immersive) {
    return (
      <>
        <SkipLink />
        <div
          className="min-h-screen w-full"
          style={{
            background: mode === "night" ? "#07131b" : "#ece5d6",
            color: "var(--ui)",
          }}
        >
          <Chrome
            mode={mode}
            onMode={changeMode}
            sound={audio.enabled}
            onSound={audio.toggle}
            minimal
          />
          <main id="main">
            <StaticPortfolio plain />
          </main>
        </div>
      </>
    );
  }

  // ---- home, the journey --------------------------------------------------
  return (
    <>
      <SkipLink />

      <Suspense fallback={null}>
        <Experience
          mode={mode}
          tier={caps.tier}
          compact={caps.compact}
          motion={1}
          onOpen={(slug) => navigate(`/work/${slug}`)}
        />
      </Suspense>

      <div
        ref={curtain}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-[1400ms] ease-out"
        style={{ background: mode === "night" ? "#061018" : "#cfe4ef", opacity: 1 }}
      />

      <HomeTitle />
      <Chrome
        mode={mode}
        onMode={changeMode}
        sound={audio.enabled}
        onSound={audio.toggle}
      />
      <Binocular mode={mode} />

      {/* the scroll runtime: this is what the camera reads */}
      <div style={{ height: JOURNEY_HEIGHT }} aria-hidden="true" />

      {/* the same portfolio, in plain HTML, for assistive tech and crawlers */}
      <main id="main" className="sr-only">
        <StaticPortfolio />
      </main>
    </>
  );
}
