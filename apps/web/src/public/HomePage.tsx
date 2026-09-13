import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { PublicProject } from "../types";
import { MediaImage } from "../components/MediaImage";
import { EnquireBand } from "./EnquireBand";
import { HeroSlideshow } from "./HeroSlideshow";
import { HomeExtras } from "./HomeExtras";
import { SiteFrame } from "./SiteFrame";
import { entriesOf, useSiteContent } from "./siteContent";

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
  const site = useSiteContent();
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
  const serviceEntries = entriesOf(site, "service");
  const stepEntries = entriesOf(site, "step");
  const servicesView = serviceEntries.length
    ? serviceEntries.map((entry) => ({ title: entry.title, body: entry.body }))
    : SERVICES;
  const stepsView = stepEntries.length
    ? stepEntries.map((entry, index) => ({
        n: entry.subtitle || String(index + 1).padStart(2, "0"),
        title: entry.title,
        body: entry.body,
      }))
    : STEPS;

  return (
    <SiteFrame>
      <HeroSlideshow projects={withPhotos} coverUrl={site?.settings.heroImageUrl || ""} />

      <section className="border-y border-white/10">
        <div className="site-shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={projects === null ? "—" : String(work.length).padStart(2, "0")} label="Works in the record" count={projects === null ? undefined : work.length} delay="0ms" />
          <Stat value={projects === null ? "—" : String(photoCount).padStart(2, "0")} label="Site photographs" count={projects === null ? undefined : photoCount} delay="80ms" />
          <Stat value="04" label="Phases, brief to handover" count={4} delay="160ms" />
          <Stat value="01" label="Contract through the build" count={1} delay="240ms" />
        </div>
      </section>

      <section id="studio" className="scroll-mt-24 py-28">
        <div className="site-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="site-mask overflow-hidden bg-[#161616]">
            {hero ? (
              <MediaImage
                url={hero.images[1]?.url || hero.images[0]?.url || ""}
                alt=""
                fit="half"
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/5] bg-[#161616]" />
            )}
          </div>
          <div className="site-in" style={{ ["--d" as string]: "120ms" }}>
            <p className="site-kicker">Studio</p>
            <h2 className="display mt-3 text-5xl leading-[0.95]">
              {site?.settings.studioHeading || "A construction practice that still draws."}
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-7 text-paper/60">
              {(site?.settings.studioBody ||
                "We are builders first. The drawing office sits next to the site diary on purpose: every line we put down has to be set out, poured, and stood under.\n\nDreamview takes a project from the first walk of the plot through structure, envelope, and interiors. One team holds the brief, the programme, and the finish.\n\nMaterials stay honest. Joints stay quiet. We would rather leave a wall that will age well than one that photographs well for a week.")
                .split(/\n\n+/)
                .map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="scroll-mt-24 py-28">
        <div className="site-shell mb-12 flex flex-wrap items-end justify-between gap-6 site-in">
          <div>
            <p className="site-kicker">Selected work</p>
            <h2 className="display mt-3 text-5xl">On site, as built</h2>
          </div>
          <Link to="/projects" className="text-[12px] tracking-[0.2em] text-paper/50 uppercase hover:text-paper">
            Full index
          </Link>
        </div>

        {projects === null && <p className="site-shell text-sm text-paper/40">Loading work…</p>}

        {projects && work.length === 0 && (
          <p className="site-shell max-w-md text-sm leading-6 text-paper/50">
            Published projects will appear here. Until then, the studio is on site.
          </p>
        )}

        {work.length > 0 && (
          <div className="site-shell space-y-16">
            {work.slice(0, 3).map((project, index) => (
              <WorkFeature key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </section>

      <section id="services" className="scroll-mt-24 py-28">
        <div className="site-shell">
          <div className="site-in">
            <p className="site-kicker">Capabilities</p>
            <h2 className="display mt-3 text-5xl">What we take on</h2>
          </div>
          <ul className="mt-12 grid gap-x-16 sm:grid-cols-2">
            {servicesView.map((service, index) => (
              <li key={service.title} className="site-in border-t border-white/10 py-7" style={{ ["--d" as string]: `${(index % 2) * 80}ms` }}>
                <p className="site-kicker">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="display mt-3 text-3xl">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-paper/50">{service.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="process" className="scroll-mt-24 py-28">
        <div className="site-shell">
          <div className="site-in">
            <p className="site-kicker">Method</p>
            <h2 className="display mt-3 text-5xl">How a job runs</h2>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {stepsView.map((step, index) => (
              <li key={step.n} className="site-in border-t border-white/10 pt-6" style={{ ["--d" as string]: `${index * 80}ms` }}>
                <p className="site-kicker">{step.n}</p>
                <h3 className="display mt-3 text-3xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-paper/50">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <HomeExtras
        noteImages={work.flatMap((project) => project.images.slice(1, 2).map((image) => image.url)).slice(0, 2)}
      />
      <EnquireBand />
    </SiteFrame>
  );
}

function Stat({
  value,
  label,
  count,
  delay = "0ms",
}: {
  value: string;
  label: string;
  count?: number;
  delay?: string;
}) {
  return (
    <div className="site-in" style={{ ["--d" as string]: delay }}>
      <p className="display text-5xl leading-none" {...(count != null ? { "data-count": count } : {})}>
        {count != null ? "00" : value}
      </p>
      <p className="mt-2 text-[11px] tracking-[0.18em] text-paper/40 uppercase">{label}</p>
    </div>
  );
}

function WorkFeature({ project, index }: { project: PublicProject; index: number }) {
  const cover = project.images[0];
  const extras = project.images.slice(1, 3);
  const reversed = index % 2 === 1;

  return (
    <article className="site-in">
      <div className={`grid items-end gap-8 lg:grid-cols-12 ${reversed ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="lg:col-span-8">
          <div className="site-mask overflow-hidden bg-[#161616]">
            {cover ? (
              <MediaImage
                url={cover.url}
                alt={cover.alt || project.title}
                fit="twoThirds"
                className="aspect-[16/10] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center text-[11px] tracking-[0.2em] text-paper/40 uppercase">
                Photography forthcoming
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-4 lg:pb-2">
          <p className="site-kicker">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="display mt-3 text-4xl">
            <Link to={`/projects/${project.slug}`} className="hover:text-gold">
              {project.title}
            </Link>
          </h3>
          {project.description && (
            <p className="mt-4 text-sm leading-7 text-paper/50 line-clamp-5">{project.description}</p>
          )}
          <Link
            to={`/projects/${project.slug}`}
            className="mt-6 inline-block text-[11px] tracking-[0.2em] text-paper uppercase underline-offset-8 hover:underline"
          >
            Open the project
          </Link>
        </div>
      </div>
      {extras.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {extras.map((image) => (
            <div key={image.id} className="site-mask overflow-hidden bg-[#161616]">
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
