import { useEffect } from "react";
import { profile, projects } from "../data/content";
import StaticPortfolio from "./StaticPortfolio";

export function PageShell({ mode, children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: mode === "night" ? "#07131b" : "#ece5d6",
        color: "var(--ui)",
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-5 py-7 md:px-8">
        <a
          href="#/"
          className="link-rule text-[10px] font-medium uppercase tracking-[0.24em]"
        >
          ← Back to the shore
        </a>
      </div>
      {children}
    </div>
  );
}

function Block({ label, children }) {
  return (
    <section className="border-t border-current/15 py-10 md:py-14">
      <h2 className="t-label mb-5 opacity-55">{label}</h2>
      <div className="max-w-xl text-[15px] leading-relaxed opacity-85">
        {children}
      </div>
    </section>
  );
}

export function CaseStudy({ slug, mode }) {
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <PageShell mode={mode}>
        <div className="mx-auto max-w-3xl px-5 py-24 md:px-8">
          <h1 className="t-display text-3xl">Not found</h1>
          <p className="mt-4 text-[15px] opacity-75">
            That case study does not exist.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell mode={mode}>
      <article className="mx-auto w-full max-w-3xl px-5 pb-28 pt-10 md:px-8 md:pt-16">
        <p className="t-mono text-[11px] uppercase tracking-[0.24em] opacity-55">
          {project.index} — {project.category}
        </p>
        <h1 className="t-display mt-5 text-[clamp(2.4rem,8vw,5rem)]">
          {project.title}
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed">
          {project.overview}
        </p>

        <Block label="Problem">{project.problem}</Block>

        <Block label="What was built">
          <ul className="list-disc space-y-1.5 pl-5">
            {project.built.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Block>

        <Block label="The hard part">{project.challenge}</Block>

        <Block label="Result">{project.result}</Block>

        <Block label="Stack">
          <p className="leading-loose">{project.stack.join("  ·  ")}</p>
        </Block>

        <Block label="What I would change">{project.change}</Block>

        <Block label="Links">
          <ul className="space-y-2">
            <li>
              <a
                className="link-rule"
                href={profile.githubHref}
                target="_blank"
                rel="noreferrer"
              >
                {profile.github}
              </a>
            </li>
            <li>
              <a className="link-rule" href={profile.emailHref}>
                {profile.email}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-[13px] opacity-60">
            Repository access and a walkthrough are available on request.
          </p>
        </Block>

        <nav className="flex flex-wrap gap-x-8 gap-y-3 border-t border-current/15 pt-10">
          {projects
            .filter((p) => p.slug !== project.slug)
            .map((p) => (
              <a
                key={p.slug}
                className="link-rule text-[11px] font-medium uppercase tracking-[0.2em]"
                href={`#/work/${p.slug}`}
              >
                {p.title}
              </a>
            ))}
        </nav>
      </article>
    </PageShell>
  );
}

export function ResumePage({ mode }) {
  return (
    <PageShell mode={mode}>
      <StaticPortfolio plain />
    </PageShell>
  );
}
