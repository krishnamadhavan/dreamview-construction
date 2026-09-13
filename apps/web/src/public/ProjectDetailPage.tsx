import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { PublicProject } from "../types";
import { MediaImage } from "../components/MediaImage";
import { projectKindLabel } from "../lib/projectKind";
import { SITE_DESCRIPTION, SITE_NAME } from "../lib/seo";
import { EnquireBand } from "./EnquireBand";
import { usePageMeta } from "./usePageMeta";
import { SiteFrame } from "./SiteFrame";

export function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<PublicProject | null>(null);
  const [siblings, setSiblings] = useState<PublicProject[]>([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setProject(null);
    setMissing(false);
    api
      .getPublishedProject(slug)
      .then((data) => {
        setProject(data.project);
      })
      .catch(() => setMissing(true));
    api
      .listPublishedProjects()
      .then((data) => setSiblings(data.projects))
      .catch(() => setSiblings([]));
  }, [slug]);

  usePageMeta(
    missing
      ? "Work — Dreamview Construction"
      : project
        ? `${project.title} — Dreamview Construction`
        : SITE_NAME,
    project?.description.trim().slice(0, 180) || SITE_DESCRIPTION,
  );

  if (missing) {
    return (
      <SiteFrame>
        <main className="site-shell py-28">
          <p className="site-kicker">Work</p>
          <h1 className="display mt-3 text-5xl">This work is not in the public record.</h1>
          <Link to="/projects" className="mt-8 inline-block text-[12px] tracking-[0.2em] uppercase text-paper/50 hover:text-paper">
            ← All work
          </Link>
        </main>
      </SiteFrame>
    );
  }

  if (!project) {
    return (
      <SiteFrame>
        <main className="site-shell py-28">
          <p className="text-sm text-paper/40">Loading project…</p>
        </main>
      </SiteFrame>
    );
  }

  const index = siblings.findIndex((item) => item.id === project.id);
  const previous = index > 0 ? siblings[index - 1] : siblings[siblings.length - 1];
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : siblings[0];
  const showNeighbors = siblings.length > 1 && previous && next && previous.id !== project.id;

  const cover = project.images[0];

  return (
    <SiteFrame>
      <main>
        <section className="relative h-[82svh] overflow-hidden bg-[#111]">
          {cover && (
            <MediaImage
              url={cover.url}
              alt={cover.alt || project.title}
              fit="hero"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
          <div className="site-shell absolute inset-x-0 bottom-[8vh]">
            <p className="site-kicker">
              {index >= 0 ? String(index + 1).padStart(2, "0") : "Project"}
            </p>
            <h1 className="display mt-2 text-5xl md:text-7xl">{project.title}</h1>
          </div>
        </section>

        <div className="border-b border-white/10">
          <div className="site-shell grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="site-kicker">Type</p>
              <p className="mt-2">{projectKindLabel(project.kind)}</p>
            </div>
            {project.location && (
              <div>
                <p className="site-kicker">Location</p>
                <p className="mt-2">{project.location}</p>
              </div>
            )}
            {project.year && (
              <div>
                <p className="site-kicker">Year</p>
                <p className="mt-2">{project.year}</p>
              </div>
            )}
            <div>
              <p className="site-kicker">Photographs</p>
              <p className="mt-2">{String(project.images.length).padStart(2, "0")}</p>
            </div>
          </div>
        </div>

        <section className="site-in site-shell max-w-3xl py-16 text-[15px] leading-7 text-paper/60 whitespace-pre-wrap">
          {project.description || "A built work from the studio record."}
        </section>

        {project.images.length > 1 && (
          <section className="site-shell grid gap-3 pb-8 md:grid-cols-2">
            {project.images.slice(1).map((image) => (
              <figure key={image.id} className="site-mask overflow-hidden bg-[#161616] first:col-span-full first:aspect-[16/9] aspect-[4/3]">
                <MediaImage url={image.url} alt={image.alt || project.title} fit="half" className="h-full w-full object-cover" />
              </figure>
            ))}
          </section>
        )}

        {showNeighbors && previous && next && (
          <section className="site-shell flex items-center justify-center border-t border-white/10 py-16">
            <Link to={`/projects/${next.slug}`} className="text-center">
              <p className="site-kicker">Next</p>
              <p className="display mt-2 text-4xl hover:text-gold">{next.title}</p>
            </Link>
          </section>
        )}
      </main>
      <EnquireBand />
    </SiteFrame>
  );
}
