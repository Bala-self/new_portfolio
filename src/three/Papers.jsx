import Paper from "./Paper";
import {
  about,
  certifications,
  education,
  profile,
  projects,
  skillGroups,
} from "../data/content";

/* ---------------------------------------------------------------- pieces */

function Edge({ children }) {
  return (
    <div className="flex items-baseline justify-between text-[10px] font-medium uppercase tracking-[0.2em] opacity-55">
      {children}
    </div>
  );
}

function Rule({ className = "" }) {
  return (
    <div
      className={`h-px w-full bg-current opacity-20 ${className}`}
      aria-hidden="true"
    />
  );
}

function SkillColumn({ group }) {
  return (
    <div>
      <div className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.22em] opacity-50">
        {group.label}
      </div>
      <ul className="space-y-[3px]">
        {group.items.map((item) => (
          <li key={item} className="text-[11.5px] leading-[1.35]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- sheets */

function AboutSheet() {
  return (
    <div className="sheet-fold flex h-full flex-col justify-between px-9 py-8">
      <Edge>
        <span>Note</span>
        <span>Chennai</span>
      </Edge>

      <div>
        <h3 className="t-display text-[clamp(26px,3.4vw,34px)]">
          {about.headline}
        </h3>
        <div className="mt-4 space-y-1">
          {about.lines.map((line) => (
            <p key={line} className="text-[15px] leading-snug">
              {line}
            </p>
          ))}
        </div>
        <p className="mt-5 text-[13px] font-medium uppercase tracking-[0.16em]">
          {about.pivot}
        </p>
      </div>

      <p className="serif-note max-w-[85%] text-[14px] leading-[1.45] opacity-75">
        {about.note}
      </p>
    </div>
  );
}

function SkillsSheetA() {
  return (
    <div className="sheet-grid flex h-full flex-col px-8 py-7">
      <Edge>
        <span>Technical sheet</span>
        <span>01 / 02</span>
      </Edge>
      <Rule className="mt-2" />
      <div className="mt-5 grid flex-1 grid-cols-2 gap-x-8 gap-y-5">
        <SkillColumn group={skillGroups[0]} />
        <div className="space-y-5">
          <SkillColumn group={skillGroups[1]} />
          <SkillColumn group={skillGroups[2]} />
        </div>
      </div>
    </div>
  );
}

function SkillsSheetB() {
  return (
    <div className="sheet-grid flex h-full flex-col px-8 py-7">
      <Edge>
        <span>Technical sheet</span>
        <span>02 / 02</span>
      </Edge>
      <Rule className="mt-2" />
      <div className="mt-5 grid flex-1 grid-cols-2 gap-x-8 gap-y-5">
        <SkillColumn group={skillGroups[3]} />
        <div className="space-y-5">
          <SkillColumn group={skillGroups[4]} />
          <SkillColumn group={skillGroups[5]} />
        </div>
      </div>
    </div>
  );
}

function ProjectSheet({ project, onOpen }) {
  return (
    <div className="flex h-full flex-col justify-between px-9 py-8">
      <Edge>
        <span>{project.category}</span>
        <span className="t-mono">{project.index}</span>
      </Edge>

      <div>
        <h3 className="t-display text-[clamp(28px,3.6vw,38px)]">
          {project.title}
        </h3>
        <p className="mt-3 text-[15px] leading-snug">{project.teaser}</p>
        <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] opacity-70">
          {project.metric}
        </p>
      </div>

      <div>
        <Rule />
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-5 gap-y-2">
          <p className="max-w-[58%] text-[10.5px] leading-[1.5] opacity-60">
            {project.stack.slice(0, 6).join(" · ")}
          </p>
          <button
            type="button"
            onClick={() => onOpen(project.slug)}
            className="link-rule shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-inherit"
          >
            View case study
          </button>
        </div>
      </div>
    </div>
  );
}

function EducationSheet() {
  return (
    <div className="sheet-ruled flex h-full flex-col justify-between px-9 py-8">
      <Edge>
        <span>Education</span>
        <span>{education.period}</span>
      </Edge>

      <div>
        <h3 className="t-display text-[clamp(22px,2.8vw,28px)] leading-[1.02]">
          {education.degree}
        </h3>
        <p className="mt-4 text-[14px] leading-snug">{education.college}</p>
        <p className="text-[13px] opacity-70">{education.place}</p>
      </div>

      <div className="flex items-end justify-between">
        <p className="t-mono text-[13px] font-medium">{education.cgpa}</p>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-70">
          {education.classification}
        </p>
      </div>
    </div>
  );
}

function CertificateSheet() {
  return (
    <div className="flex h-full flex-col justify-between px-8 py-7">
      <Edge>
        <span>Certifications</span>
        <span>02</span>
      </Edge>
      <ul className="space-y-4">
        {certifications.map((c) => (
          <li key={c.name}>
            <p className="text-[14px] leading-snug">{c.name}</p>
            {c.meta && (
              <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.18em] opacity-60">
                {c.meta}
              </p>
            )}
          </li>
        ))}
      </ul>
      <Rule />
    </div>
  );
}

function ContactSheet() {
  const row =
    "flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 py-[7px]";
  const key = "text-[10px] uppercase tracking-[0.2em] opacity-55";
  const val = "link-rule text-[13.5px]";
  return (
    <div className="sheet-fold flex h-full flex-col justify-between px-9 py-8">
      <Edge>
        <span>Contact</span>
        <span>{profile.availability}</span>
      </Edge>

      <h3 className="t-display text-[clamp(30px,4vw,42px)]">Let&rsquo;s talk.</h3>

      <div className="-mt-2">
        <Rule />
        <div className={row}>
          <span className={key}>Email</span>
          <a className={val} href={profile.emailHref}>
            {profile.email}
          </a>
        </div>
        <Rule />
        <div className={row}>
          <span className={key}>Phone</span>
          <a className={val} href={profile.phoneHref}>
            {profile.phone}
          </a>
        </div>
        <Rule />
        <div className={row}>
          <span className={key}>Elsewhere</span>
          <span className="flex gap-4">
            <a className={val} href={profile.githubHref} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className={val} href={profile.linkedinHref} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className={val} href="#/resume">
              Résumé
            </a>
          </span>
        </div>
        <Rule />
        <p className="pt-3 text-[10.5px] uppercase tracking-[0.18em] opacity-60">
          {profile.availabilityNote}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ the stream */

export default function Papers({ palette, compact, motion = 1, onOpen }) {
  // one sheet format for wide screens, a portrait format for phones
  const big = compact ? { width: 318, height: 436 } : { width: 566, height: 372 };
  const tech = compact ? { width: 322, height: 448 } : { width: 592, height: 378 };
  const card = compact ? { width: 312, height: 408 } : { width: 528, height: 344 };
  const cert = compact ? { width: 288, height: 342 } : { width: 430, height: 272 };

  const common = { palette, motion };

  return (
    <group>
      {/* ABOUT — a folded note, carried in low from the left */}
      <Paper
        {...common}
        {...big}
        range={[0.152, 0.298]}
        seed={1.3}
        config={{
          enterX: -8.5,
          enterY: 1.1,
          enterDist: 10,
          readDist: 4.45,
          readX: -0.15,
          exitX: 5.5,
          exitY: 2.4,
          curl: 0.14,
          restRoll: -0.035,
          lag: 2.1,
        }}
      >
        <AboutSheet />
      </Paper>

      {/* SKILLS — two technical sheets, the second slipping in behind */}
      <Paper
        {...common}
        {...tech}
        range={[0.303, 0.379]}
        seed={2.6}
        config={{
          enterX: 7.0,
          enterY: 2.9,
          enterDist: 9.5,
          readDist: 4.55,
          readX: 0.05,
          exitX: -5.0,
          exitY: -2.2,
          curl: 0.07,
          restRoll: 0.025,
          lag: 2.8,
        }}
      >
        <SkillsSheetA />
      </Paper>
      <Paper
        {...common}
        {...tech}
        range={[0.374, 0.448]}
        seed={4.1}
        config={{
          enterX: -6.2,
          enterY: -2.4,
          enterDist: 8.6,
          readDist: 4.5,
          readX: -0.05,
          exitX: 5.8,
          exitY: 2.0,
          curl: 0.08,
          restRoll: -0.02,
          lag: 2.6,
        }}
      >
        <SkillsSheetB />
      </Paper>

      {/* PROJECTS — three sheets passing one after another, briefly together */}
      <Paper
        {...common}
        {...card}
        range={[0.449, 0.516]}
        seed={6.2}
        config={{
          enterX: 6.4,
          enterY: 1.8,
          enterDist: 9.0,
          readDist: 4.35,
          readX: 0.0,
          exitX: -4.4,
          exitY: 1.9,
          curl: 0.09,
          restRoll: 0.03,
          lag: 2.5,
        }}
      >
        <ProjectSheet project={projects[0]} onOpen={onOpen} />
      </Paper>
      <Paper
        {...common}
        {...card}
        range={[0.507, 0.5585]}
        seed={7.7}
        config={{
          enterX: -5.6,
          enterY: 2.2,
          enterDist: 8.2,
          readDist: 4.3,
          readX: 0.05,
          exitX: 5.2,
          exitY: -1.7,
          curl: 0.11,
          restRoll: -0.04,
          lag: 2.2,
        }}
      >
        <ProjectSheet project={projects[1]} onOpen={onOpen} />
      </Paper>
      <Paper
        {...common}
        {...card}
        range={[0.549, 0.601]}
        seed={9.4}
        config={{
          enterX: 5.0,
          enterY: -2.6,
          enterDist: 7.8,
          readDist: 4.3,
          readX: -0.05,
          exitX: -5.6,
          exitY: 2.3,
          curl: 0.1,
          restRoll: 0.022,
          lag: 2.35,
        }}
      >
        <ProjectSheet project={projects[2]} onOpen={onOpen} />
      </Paper>

      {/* EDUCATION — a heavier, formal document; it moves more slowly */}
      <Paper
        {...common}
        {...big}
        range={[0.603, 0.688]}
        seed={11.1}
        config={{
          enterX: -7.2,
          enterY: 2.4,
          enterDist: 9.4,
          readDist: 4.5,
          readX: -0.1,
          readY: 0.3,
          exitX: 4.6,
          exitY: -2.4,
          curl: 0.05,
          restRoll: -0.015,
          lag: 1.8,
        }}
      >
        <EducationSheet />
      </Paper>

      {/* CERTIFICATIONS — a smaller, lighter sheet that skips past */}
      <Paper
        {...common}
        {...cert}
        range={[0.681, 0.748]}
        seed={13.8}
        config={{
          enterX: 5.4,
          enterY: -2.0,
          enterDist: 7.4,
          readDist: 3.65,
          readX: 0.1,
          readY: 0.34,
          exitX: -4.8,
          exitY: 2.6,
          curl: 0.13,
          restRoll: 0.045,
          lag: 3.1,
        }}
      >
        <CertificateSheet />
      </Paper>

      {/* CONTACT — the last sheet, settling close and staying steady */}
      <Paper
        {...common}
        {...big}
        range={[0.753, 0.888]}
        seed={16.5}
        config={{
          enterX: -6.0,
          enterY: 2.8,
          enterDist: 8.8,
          readDist: 4.2,
          readX: 0.0,
          readY: 0.32,
          exitX: 0.4,
          exitY: 4.6,
          exitDist: 7.5,
          curl: 0.09,
          restRoll: -0.012,
          lag: 2.0,
        }}
      >
        <ContactSheet />
      </Paper>
    </group>
  );
}
