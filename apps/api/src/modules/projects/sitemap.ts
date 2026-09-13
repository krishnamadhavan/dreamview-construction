import type { FastifyInstance, FastifyRequest } from "fastify";
import { listPublishedProjects } from "./service.js";

function originFrom(request: FastifyRequest): string {
  const proto = String(request.headers["x-forwarded-proto"] ?? request.protocol ?? "http")
    .split(",")[0]
    ?.trim();
  const host = String(request.headers["x-forwarded-host"] ?? request.headers.host ?? request.hostname)
    .split(",")[0]
    ?.trim();
  return `${proto || "https"}://${host || "dreamviewconstructions.com"}`.replace(/\/$/, "");
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function sitemapRoutes(app: FastifyInstance): Promise<void> {
  app.get("/sitemap.xml", async (request, reply) => {
    const origin = originFrom(request);
    const projects = await listPublishedProjects();
    const paths = ["/", "/projects", ...projects.map((project) => `/projects/${project.slug}`)];
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) => `  <url>
    <loc>${escapeXml(`${origin}${path}`)}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
    return reply.type("application/xml; charset=utf-8").send(body);
  });
}
