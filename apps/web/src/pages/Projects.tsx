import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowIcon } from "../components/ArrowIcon";
import { api } from "../api";
import { MediaImage } from "../components/MediaImage";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../toast";
import { formatSchedule } from "../lib/datetime";
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
          <p className="text-[11px] tracking-[0.3em] text-gold uppercase">Archive</p>
          <h1 className="display mt-1 text-5xl">Work</h1>
        </div>
        <Link to="/admin/projects/new" className="admin-btn">
          New project
          <ArrowIcon />
        </Link>
      </div>

      {projects === null && <p className="mt-10 text-sm text-paper/50">Loading…</p>}

      {projects && projects.length === 0 && (
        <div className="mt-10 border border-dashed border-white/15 px-8 py-16 text-center">
          <p className="display text-3xl">No projects yet</p>
          <p className="mt-3 text-sm text-paper/50">Create the first one and attach site photography.</p>
          <Link to="/admin/projects/new" className="admin-btn mt-6">
            Create a project
            <ArrowIcon />
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
                  to={`/admin/projects/${project.id}`}
                  className="block overflow-hidden border border-white/10 bg-[#111] transition hover:-translate-y-0.5 hover:border-gold/50"
                >
                  <div className="aspect-[16/10] bg-[#161616]">
                    {cover ? (
                      <MediaImage url={cover.url} alt={cover.alt || project.title} fit="thumb" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs tracking-wide text-paper/40 uppercase">
                        No images
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="display text-2xl leading-tight">{project.title}</h2>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="line-clamp-2 text-sm text-paper/50">
                      {project.description || "No description"}
                    </p>
                    <p className="text-[11px] tracking-wide text-paper/40 uppercase">
                      {project.images.length} {project.images.length === 1 ? "image" : "images"}
                      {project.status === "scheduled" && project.publishAt
                        ? ` · live ${formatSchedule(project.publishAt)}`
                        : ""}
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
