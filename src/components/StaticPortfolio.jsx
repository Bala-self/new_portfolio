import {
  about,
  certifications,
  education,
  languages,
  profile,
  projects,
  skillGroups,
  work,
} from "../data/content";

function Section({ id, label, children }) {
  return (
    <section id={id} className="border-t border-current/15 py-12 md:py-20">
      <h2 className="t-label mb-8 opacity-55">{label}</h2>
      {children}
    </section>
  );
}

/**
 * The whole portfolio as ordinary HTML.
 * It is the accessible and crawlable source of truth behind the 3D journey,
 * and it becomes the visible page when motion is reduced or WebGL is absent.
 */
export default function StaticPortfolio({ plain = false }) {
  return (
    <div
      className={
        plain
          ? "mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8"
          : "mx-auto w-full max-w-3xl px-5"
      }
      style={{ color: "var(--ui)" }}
    >
      <header className="pb-10 md:pb-16">
        <h1 className="t-display text-[clamp(2.2rem,7vw,4.5rem)]">
          {profile.name}
        </h1>
        <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.3em]">
          {profile.role}
        </p>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed opacity-75">
          {profile.summary}
        </p>
        <p className="mt-6 text-[11px] uppercase tracking-[0.2em] opacity-60">
          {profile.location}
          <span className="mx-2.5">·</span>
          {profile.availability}
          <span className="mx-2.5">·</span>
          {profile.availabilityNote}
        </p>
      </header>

      <Section id="about" label="About">
        <p className="t-display text-[clamp(1.6rem,4vw,2.6rem)]">
          {about.headline}
        </p>
        <ul className="mt-6 space-y-1 text-[16px]">
          {about.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <p className="mt-6 text-[13px] font-medium uppercase tracking-[0.18em]">
          {about.pivot}
        </p>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed opacity-75">
          {about.note}
        </p>
      </Section>

      <Section id="experience" label="Experience">
        <p className="text-[17px]">{work.title}</p>
        <p className="mt-1 text-[12px] uppercase tracking-[0.18em] opacity-60">
          {work.period}
        </p>
      </Section>

      <Section id="skills" label="Skills">
        <div className="grid gap-9 sm:grid-cols-2">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] opacity-55">
                {group.label}
              </h3>
              <ul className="space-y-1 text-[14px]">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="projects" label="Selected work">
        <div className="space-y-12">
          {projects.map((p) => (
            <article key={p.slug}>
              <h3 className="t-display text-[clamp(1.4rem,3.4vw,2.1rem)]">
                {p.title}
              </h3>
              <p className="mt-2 text-[12px] uppercase tracking-[0.18em] opacity-60">
                {p.category}
                <span className="mx-2.5">·</span>
                {p.metric}
              </p>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed opacity-80">
                {p.overview}
              </p>
              <ul className="mt-4 max-w-xl list-disc space-y-1 pl-5 text-[14px] leading-relaxed opacity-75">
                {p.built.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="mt-4 max-w-xl text-[14px] leading-relaxed opacity-75">
                {p.result}
              </p>
              <p className="mt-4">
                <a
                  className="link-rule text-[11px] font-medium uppercase tracking-[0.2em]"
                  href={`#/work/${p.slug}`}
                >
                  Read the case study
                </a>
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="education" label="Education">
        <h3 className="t-display text-[clamp(1.3rem,3vw,1.9rem)]">
          {education.degree}
        </h3>
        <p className="mt-3 text-[15px]">{education.college}</p>
        <p className="text-[14px] opacity-70">{education.place}</p>
        <p className="mt-3 text-[12px] uppercase tracking-[0.18em] opacity-70">
          {education.period}
          <span className="mx-2.5">·</span>
          {education.cgpa}
          <span className="mx-2.5">·</span>
          {education.classification}
        </p>
      </Section>

      <Section id="certifications" label="Certifications">
        <ul className="space-y-3 text-[15px]">
          {certifications.map((c) => (
            <li key={c.name}>
              {c.name}
              {c.meta && (
                <span className="ml-3 text-[11px] uppercase tracking-[0.18em] opacity-60">
                  {c.meta}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="languages" label="Languages">
        <ul className="space-y-2 text-[15px]">
          {languages.map((l) => (
            <li key={l.name}>
              {l.name}
              <span className="ml-3 text-[12px] uppercase tracking-[0.18em] opacity-60">
                {l.level}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="contact" label="Contact">
        <p className="t-display text-[clamp(1.8rem,5vw,3rem)]">Let&rsquo;s talk.</p>
        <ul className="mt-8 space-y-3 text-[15px]">
          <li>
            <a className="link-rule" href={profile.emailHref}>
              {profile.email}
            </a>
          </li>
          <li>
            <a className="link-rule" href={profile.phoneHref}>
              {profile.phone}
            </a>
          </li>
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
            <a
              className="link-rule"
              href={profile.linkedinHref}
              target="_blank"
              rel="noreferrer"
            >
              {profile.linkedin}
            </a>
          </li>
          <li>
            <a className="link-rule" href="#/resume">
              Résumé
            </a>
          </li>
        </ul>
        <p className="mt-8 text-[11px] uppercase tracking-[0.2em] opacity-60">
          {profile.availability}
          <span className="mx-2.5">·</span>
          {profile.availabilityNote}
        </p>
      </Section>
    </div>
  );
}
