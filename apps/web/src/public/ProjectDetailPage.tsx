import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { PublicProject } from "../types";
import { MediaImage } from "../components/MediaImage";
import { EnquireBand } from "./EnquireBand";
import { ImageCarousel } from "./ImageCarousel";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

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
        document.title = `${data.project.title} — Dreamview`;
      })
      .catch(() => setMissing(true));
    api
      .listPublishedProjects()
      .then((data) => setSiblings(data.projects))
      .catch(() => setSiblings([]));
  }, [slug]);

  if (missing) {
    return (
      <div className="min-h-screen bg-paper">
        <SiteHeader />
        <main className="px-6 pt-32 pb-24 md:px-10 lg:px-16">
          <p className="text-[11px] tracking-[0.28em] text-ink-soft uppercase">Projects</p>
          <h1 className="display mt-3 text-5xl">This work is not in the public record.</h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-ink-soft">
            It may still be a draft, or the address is wrong.
          </p>
          <Link
            to="/projects"
            className="mt-8 inline-block text-[12px] tracking-[0.2em] uppercase underline-offset-8 hover:underline"
          >
            Back to the index
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-paper">
        <SiteHeader />
        <main className="px-6 pt-32 md:px-10 lg:px-16">
          <p className="text-sm text-ink-soft">Loading project…</p>
        </main>
      </div>
    );
  }

  const others = siblings.filter((item) => item.id !== project.id);
  const index = siblings.findIndex((item) => item.id === project.id);
  const previous = index > 0 ? siblings[index - 1] : siblings[siblings.length - 1];
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : siblings[0];
  const showNeighbors = siblings.length > 1 && previous && next && previous.id !== project.id;

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main>
        <section className="px-6 pt-28 md:px-10 md:pt-32 lg:px-16">
          <Link
            to="/projects"
            className="text-[11px] tracking-[0.22em] text-ink-soft uppercase hover:text-ink"
          >
            ← Index
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-ink-soft uppercase">
                {index >= 0 ? String(index + 1).padStart(2, "0") : "Project"}
              </p>
              <h1 className="display mt-3 text-5xl leading-[0.95] md:text-6xl">{project.title}</h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-ink-soft whitespace-pre-wrap">
              {project.description || "A built work from the studio record."}
            </p>
          </div>
        </section>

        <section className="mt-12 px-6 md:px-10 lg:px-16">
          <ImageCarousel images={project.images} title={project.title} aspect="aspect-[16/9]" fit="full" />
        </section>

        {project.images.length > 1 && (
          <section className="px-6 pt-4 md:px-10 lg:px-16">
            <div className="grid gap-4 md:grid-cols-2">
              {project.images.map((image) => (
                <figure key={image.id} className="overflow-hidden bg-sand">
                  <MediaImage
                    url={image.url}
                    alt={image.alt || project.title}
                    fit="half"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="px-6 py-24 md:px-10 md:py-28 lg:px-16">
          <div className="grid gap-14 border-t border-line pt-14 lg:grid-cols-3">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-ink-soft uppercase">On this job</p>
              <p className="display mt-3 text-3xl">One team, drawing to site.</p>
            </div>
            <p className="text-sm leading-7 text-ink-soft">
              The same people who walked the plot stayed through structure, envelope, and finish.
              Photography here is the building as handed over — not a staging set.
            </p>
            <dl className="space-y-6">
              <div>
                <dt className="text-[11px] tracking-[0.2em] text-ink-soft uppercase">Record</dt>
                <dd className="mt-1 text-sm">{project.images.length} site photographs</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.2em] text-ink-soft uppercase">Reference</dt>
                <dd className="mt-1 font-mono text-sm">/{project.slug}</dd>
              </div>
            </dl>
          </div>
        </section>

        {showNeighbors && previous && next && (
          <section className="border-t border-line px-6 py-16 md:px-10 lg:px-16">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <Link to={`/projects/${previous.slug}`} className="group max-w-sm">
                <p className="text-[11px] tracking-[0.2em] text-ink-soft uppercase">Previous</p>
                <p className="display mt-2 text-3xl group-hover:text-clay">{previous.title}</p>
              </Link>
              <Link to={`/projects/${next.slug}`} className="group max-w-sm text-right">
                <p className="text-[11px] tracking-[0.2em] text-ink-soft uppercase">Next</p>
                <p className="display mt-2 text-3xl group-hover:text-clay">{next.title}</p>
              </Link>
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section className="border-t border-line px-6 py-24 md:px-10 lg:px-16">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[11px] tracking-[0.28em] text-ink-soft uppercase">Also in the record</p>
                <h2 className="display mt-3 text-4xl">Other sites</h2>
              </div>
              <Link
                to="/projects"
                className="text-[12px] tracking-[0.2em] text-ink-soft uppercase underline-offset-8 hover:text-ink hover:underline"
              >
                Full index
              </Link>
            </div>
            <ul className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2">
              {others.map((item) => (
                <li key={item.id}>
                  <ImageCarousel images={item.images} title={item.title} />
                  <h3 className="display mt-4 text-3xl">
                    <Link to={`/projects/${item.slug}`} className="hover:text-clay">
                      {item.title}
                    </Link>
                  </h3>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <EnquireBand />
      <SiteFooter />
    </div>
  );
}
