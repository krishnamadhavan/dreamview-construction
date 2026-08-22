import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../toast";
import type { Project } from "../types";

export function ProjectsPage() {
  const toast = useToast();
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    api
      .listProjects()
      .then((data) => setProjects(data.projects))
      .catch((error) => {
        toast.push(error instanceof Error ? error.message : "Could not load projects", "err");
        setProjects([]);
      });
  }, [toast]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-ink-soft uppercase">Content</p>
          <h1 className="display mt-1 text-4xl">Projects</h1>
        </div>
        <Link
          to="/projects/new"
          className="rounded-md bg-clay px-4 py-2.5 text-sm text-white hover:bg-clay-dark"
        >
          New project
        </Link>
      </div>

      {projects === null && <p className="mt-10 text-sm text-ink-soft">Loading…</p>}

      {projects && projects.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-line bg-white px-8 py-16 text-center">
          <p className="display text-3xl">No projects yet</p>
          <p className="mt-3 text-sm text-ink-soft">Create the first one and attach site photography.</p>
          <Link
            to="/projects/new"
            className="mt-6 inline-block rounded-md bg-ink px-4 py-2.5 text-sm text-paper"
          >
            Create a project
          </Link>
        </div>
      )}

      {projects && projects.length > 0 && (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const cover = project.images[0];
            return (
              <li key={project.id}>
                <Link
                  to={`/projects/${project.id}`}
                  className="block overflow-hidden rounded-lg border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-[16/10] bg-sand">
                    {cover ? (
                      <img src={cover.url} alt={cover.alt || project.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs tracking-wide text-ink-soft uppercase">
                        No images
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="display text-2xl leading-tight">{project.title}</h2>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="line-clamp-2 text-sm text-ink-soft">
                      {project.description || "No description"}
                    </p>
                    <p className="text-[11px] tracking-wide text-ink-soft uppercase">
                      {project.images.length} {project.images.length === 1 ? "image" : "images"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
