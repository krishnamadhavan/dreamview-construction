import { useEffect, useState } from "react";
import { api } from "../api";
import type { PublicProject } from "../types";
import { EnquireBand } from "./EnquireBand";
import { usePageMeta } from "./usePageMeta";
import { SiteFrame } from "./SiteFrame";
import { WorkDeck } from "./WorkDeck";

export function PublicProjectsPage() {
  const [projects, setProjects] = useState<PublicProject[] | null>(null);

  usePageMeta("Work — Dreamview Construction", "Selected construction, interiors, and restoration from the Dreamview record.");

  useEffect(() => {
    api
      .listPublishedProjects()
      .then((data) => setProjects(data.projects))
      .catch(() => setProjects([]));
  }, []);

  const photoCount = projects?.reduce((sum, project) => sum + project.images.length, 0) ?? 0;

  return (
    <SiteFrame>
      <main className="pb-16 pt-16">
        <section className="site-shell">
          <p className="site-kicker">Archive</p>
          <h1 className="display mt-3 text-5xl md:text-6xl">Selected work</h1>
          <p className="mt-4 text-sm text-paper/40">
            {projects === null ? "—" : String(projects.length).padStart(2, "0")} works ·{" "}
            {projects === null ? "—" : String(photoCount).padStart(2, "0")} photographs
          </p>
        </section>
        <section className="mt-10">
          {projects === null && <p className="site-shell text-sm text-paper/40">Loading work…</p>}
          {projects && projects.length === 0 && (
            <p className="site-shell max-w-md text-sm text-paper/50">No published projects yet.</p>
          )}
          {projects && projects.length > 0 && <WorkDeck projects={projects} />}
        </section>
      </main>
      <EnquireBand />
    </SiteFrame>
  );
}
