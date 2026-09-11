import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { PublicProject } from "../types";
import { EnquireBand } from "./EnquireBand";
import { ImageCarousel } from "./ImageCarousel";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PublicProjectsPage() {
  const [projects, setProjects] = useState<PublicProject[] | null>(null);

  useEffect(() => {
    document.title = "Projects — Dreamview";
    api
      .listPublishedProjects()
      .then((data) => setProjects(data.projects))
      .catch(() => setProjects([]));
  }, []);

  const photoCount = projects?.reduce((sum, project) => sum + project.images.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main>
        <section className="px-6 pt-28 pb-16 md:px-10 md:pt-32 md:pb-20 lg:px-16">
          <p className="text-[11px] tracking-[0.28em] text-ink-soft uppercase">Index</p>
          <h1 className="display mt-3 max-w-4xl text-5xl leading-[0.95] md:text-6xl">
            Sites we have planned and built.
          </h1>
          <div className="mt-10 grid gap-10 border-t border-line pt-10 lg:grid-cols-[1.2fr_0.8fr]">
            <p className="max-w-xl text-sm leading-7 text-ink-soft">
              Each card is a finished job, photographed as it stands. Step through the set by hand —
              nothing autoplays — then open a project for the full record.
            </p>
            <dl className="grid grid-cols-2 gap-8">
              <div>
                <dt className="text-[11px] tracking-[0.2em] text-ink-soft uppercase">Works</dt>
                <dd className="display mt-2 text-4xl">
                  {projects === null ? "—" : String(projects.length).padStart(2, "0")}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.2em] text-ink-soft uppercase">Photographs</dt>
                <dd className="display mt-2 text-4xl">
                  {projects === null ? "—" : String(photoCount).padStart(2, "0")}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="px-6 pb-24 md:px-10 lg:px-16">
          {projects === null && <p className="text-sm text-ink-soft">Loading work…</p>}

          {projects && projects.length === 0 && (
            <p className="max-w-md text-sm leading-6 text-ink-soft">
              No published projects yet. Work will be listed here once it is ready to show.
            </p>
          )}

          {projects && projects.length > 0 && (
            <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2">
              {projects.map((project, index) => (
                <li key={project.id}>
                  <article>
                    <ImageCarousel images={project.images} title={project.title} />
                    <div className="mt-5 flex items-baseline justify-between gap-4">
                      <p className="text-[11px] tracking-[0.22em] text-ink-soft uppercase">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="text-[11px] tracking-[0.18em] text-ink-soft uppercase">
                        {project.images.length} {project.images.length === 1 ? "image" : "images"}
                      </p>
                    </div>
                    <h2 className="display mt-2 text-3xl md:text-4xl">
                      <Link to={`/projects/${project.slug}`} className="hover:text-clay">
                        {project.title}
                      </Link>
                    </h2>
                    {project.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-soft">
                        {project.description}
                      </p>
                    )}
                    <Link
                      to={`/projects/${project.slug}`}
                      className="mt-5 inline-block text-[11px] tracking-[0.2em] text-ink uppercase underline-offset-8 hover:underline"
                    >
                      Open the project
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <EnquireBand />
      <SiteFooter />
    </div>
  );
}
