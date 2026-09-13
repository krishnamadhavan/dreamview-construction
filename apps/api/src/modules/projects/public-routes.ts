import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ProjectImage } from "../../db/schema.js";
import { getPublishedProjectBySlug, listPublishedProjects, type ProjectWithImages } from "./service.js";

const slugParam = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

function toPublic(project: ProjectWithImages) {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    location: project.location,
    year: project.year,
    kind: project.kind,
    images: project.images.map((image: ProjectImage) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
    })),
  };
}

export async function publicProjectRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/public/projects", async () => {
    const projects = await listPublishedProjects();
    return { projects: projects.map(toPublic) };
  });

  app.get("/api/public/projects/:slug", async (request) => {
    const { slug } = slugParam.parse(request.params);
    const project = await getPublishedProjectBySlug(slug);
    return { project: toPublic(project) };
  });
}
