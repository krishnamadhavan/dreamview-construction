import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { PublicProject } from "../types";
import { MediaImage } from "../components/MediaImage";
import { EnquireBand } from "./EnquireBand";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

const SERVICES = [
  {
    title: "New construction",
    body: "Ground-up buildings — structure, envelope, and the rooms inside — run as one contract from first set-out to handover.",
  },
  {
    title: "Interiors & fit-out",
    body: "Joinery, finishes, and services coordinated so the last room is as considered as the first slab.",
  },
  {
    title: "Structural works",
    body: "Frames, foundations, and alterations handled with the engineer in the room, not after the fact.",
  },
  {
    title: "Restoration",
    body: "Older fabric kept honest. We repair what should stay and replace only what has failed.",
  },
  {
    title: "Site coordination",
    body: "Trades sequenced on a live site. One superintendent, one programme, no competing stories.",
  },
  {
    title: "Project leadership",
    body: "Cost, programme, and quality held in the same hand from briefing through defects.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Brief",
    body: "We walk the plot, read the constraints, and write down what the building must actually do.",
  },
  {
    n: "02",
    title: "Plan",
    body: "Drawings, method, and a programme that the site can keep. No theatre — a buildable set.",
  },
  {
    n: "03",
    title: "Build",
    body: "The same people who planned it stay on site. Structure first, then the work you can touch.",
  },
  {
    n: "04",
    title: "Handover",
    body: "Snag, document, and leave the keys with a building that is ready to be lived in.",
  },
];

export function HomePage() {
  const [projects, setProjects] = useState<PublicProject[] | null>(null);

  useEffect(() => {
    document.title = "Dreamview";
    api
      .listPublishedProjects()
      .then((data) => setProjects(data.projects))
      .catch(() => setProjects([]));
  }, []);

  const withPhotos = projects?.filter((project) => project.images.length > 0) ?? [];
  const hero = withPhotos[0];
  const work = projects ?? [];
  const photoCount = work.reduce((sum, project) => sum + project.images.length, 0);

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader onInk />

      <section className="relative min-h-[100svh] overflow-hidden bg-ink text-paper">
        {hero ? (
          <MediaImage
            url={hero.images[0]?.url ?? ""}
            alt={hero.images[0]?.alt || hero.title}
            fit="hero"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#4a433a_1px,transparent_1px),linear-gradient(90deg,#4a433a_1px,transparent_1px)] [background-size:56px_56px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/25" />
        <div className="relative flex min-h-[100svh] flex-col justify-end px-6 pt-28 pb-16 md:px-10 lg:px-16 lg:pb-20">
          <p className="text-[11px] tracking-[0.32em] uppercase">Construction</p>
          <h1 className="display mt-5 max-w-4xl text-[3.1rem] leading-[0.92] sm:text-6xl lg:text-7xl">
            Buildings with weight, light, and a long life.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-sand">
            Dreamview plans and delivers construction with a studio’s eye — structure first, then the
            rooms people actually inhabit.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <a
              href="#work"
              className="text-[12px] tracking-[0.22em] uppercase underline-offset-8 hover:underline"
            >
              Selected work
            </a>
            <a
              href="#contact"
              className="text-[12px] tracking-[0.22em] text-sand uppercase underline-offset-8 hover:text-paper hover:underline"
            >
              Start a project
            </a>
          </div>
        </div>
      </section>

      <section id="studio" className="scroll-mt-8 px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-ink-soft uppercase">The studio</p>
            <h2 className="display mt-4 text-4xl leading-[1.05] md:text-5xl">
              A construction practice that still draws.
            </h2>
          </div>
          <div className="space-y-6 text-[15px] leading-7 text-ink-soft">
            <p>
              We are builders first. The drawing office sits next to the site diary on purpose: every
              line we put down has to be set out, poured, and stood under.
            </p>
            <p>
              Dreamview takes a project from the first walk of the plot through structure, envelope,
              and interiors. One team holds the brief, the programme, and the finish — so the
              building that opens is the one that was promised.
            </p>
            <p>
              Materials stay honest. Joints stay quiet. We would rather leave a wall that will age
              well than one that photographs well for a week.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink px-6 py-16 text-paper md:px-10 lg:px-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={projects === null ? "—" : String(work.length).padStart(2, "0")} label="Works in the record" />
          <Stat value={projects === null ? "—" : String(photoCount).padStart(2, "0")} label="Site photographs" />
          <Stat value="04" label="Phases, brief to handover" />
          <Stat value="01" label="Contract through the build" />
        </div>
      </section>

      <section id="work" className="scroll-mt-8 px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-ink-soft uppercase">Selected work</p>
            <h2 className="display mt-3 text-4xl md:text-5xl">On site, as built</h2>
          </div>
          <Link
            to="/projects"
            className="text-[12px] tracking-[0.2em] text-ink-soft uppercase underline-offset-8 hover:text-ink hover:underline"
          >
            Full index
          </Link>
        </div>

        {projects === null && <p className="mt-16 text-sm text-ink-soft">Loading work…</p>}

        {projects && work.length === 0 && (
          <p className="mt-16 max-w-md text-sm leading-6 text-ink-soft">
            Published projects will appear here. Until then, the studio is on site.
          </p>
        )}

        {work.length > 0 && (
          <div className="mt-16 space-y-28">
            {work.map((project, index) => (
              <WorkFeature key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </section>

      <section id="services" className="scroll-mt-8 border-t border-line bg-white px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <div className="max-w-2xl">
          <p className="text-[11px] tracking-[0.28em] text-ink-soft uppercase">Capabilities</p>
          <h2 className="display mt-3 text-4xl md:text-5xl">What we take on</h2>
          <p className="mt-5 text-sm leading-7 text-ink-soft">
            A single practice covering the work a site actually needs — not a catalogue of extras.
          </p>
        </div>
        <ul className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service, index) => (
            <li key={service.title} className="border-t border-line pt-6">
              <p className="text-[11px] tracking-[0.2em] text-clay uppercase">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="display mt-3 text-2xl">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{service.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="process" className="scroll-mt-8 px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <div className="max-w-2xl">
          <p className="text-[11px] tracking-[0.28em] text-ink-soft uppercase">Method</p>
          <h2 className="display mt-3 text-4xl md:text-5xl">How a job runs</h2>
          <p className="mt-5 text-sm leading-7 text-ink-soft">
            Four stages, one team. We do not hand a drawing over a wall and hope the site invents the rest.
          </p>
        </div>
        <ol className="mt-16 grid gap-0 border-t border-line md:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.n} className="border-line py-10 md:border-r md:px-6 md:py-12 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <p className="font-mono text-xs tracking-[0.18em] text-clay">{step.n}</p>
              <h3 className="display mt-4 text-3xl">{step.title}</h3>
              <p className="mt-4 text-sm leading-6 text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <EnquireBand />
      <SiteFooter />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="display text-5xl leading-none md:text-6xl">{value}</p>
      <p className="mt-3 text-[11px] tracking-[0.2em] text-sand uppercase">{label}</p>
    </div>
  );
}

function WorkFeature({ project, index }: { project: PublicProject; index: number }) {
  const cover = project.images[0];
  const extras = project.images.slice(1, 3);
  const reversed = index % 2 === 1;

  return (
    <article>
      <div className={`grid items-end gap-8 lg:grid-cols-12 ${reversed ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="lg:col-span-8">
          <div className="overflow-hidden bg-sand">
            {cover ? (
              <MediaImage
                url={cover.url}
                alt={cover.alt || project.title}
                fit="twoThirds"
                className="aspect-[16/10] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center text-[11px] tracking-[0.2em] text-ink-soft uppercase">
                Photography forthcoming
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-4 lg:pb-2">
          <p className="text-[11px] tracking-[0.24em] text-ink-soft uppercase">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="display mt-3 text-4xl">
            <Link to={`/projects/${project.slug}`} className="hover:text-clay">
              {project.title}
            </Link>
          </h3>
          {project.description && (
            <p className="mt-4 text-sm leading-7 text-ink-soft line-clamp-5">{project.description}</p>
          )}
          <Link
            to={`/projects/${project.slug}`}
            className="mt-6 inline-block text-[11px] tracking-[0.2em] text-ink uppercase underline-offset-8 hover:underline"
          >
            Open the project
          </Link>
        </div>
      </div>
      {extras.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {extras.map((image) => (
            <div key={image.id} className="overflow-hidden bg-sand">
              <MediaImage
                url={image.url}
                alt={image.alt || project.title}
                fit="half"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
