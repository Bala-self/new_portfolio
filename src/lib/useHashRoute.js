import { useEffect, useState } from "react";

function current() {
  const raw = window.location.hash.replace(/^#/, "");
  return raw.length > 1 ? raw : "/";
}

export function useHashRoute() {
  const [route, setRoute] = useState(current);

  useEffect(() => {
    const onChange = () => setRoute(current());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export function navigate(path) {
  window.location.hash = path;
}
