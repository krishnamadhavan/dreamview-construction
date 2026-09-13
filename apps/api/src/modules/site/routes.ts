import type { FastifyInstance } from "fastify";
import { AppError } from "../../lib/errors.js";
import { saveSiteBody } from "./schemas.js";
import { clearHeroImage, getSiteContent, saveSiteContent, setHeroImage } from "./service.js";

function toPublic(content: Awaited<ReturnType<typeof getSiteContent>>) {
  return {
    settings: {
      studioHeading: content.settings.studioHeading,
      studioBody: content.settings.studioBody,
      territoryHeading: content.settings.territoryHeading,
      territoryBody: content.settings.territoryBody,
      enquireHeading: content.settings.enquireHeading,
      enquireBody: content.settings.enquireBody,
      phone: content.settings.phone,
      email: content.settings.email,
      studioNote: content.settings.studioNote,
      heroImageUrl: content.settings.heroImageUrl,
    },
    entries: content.entries.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      title: entry.title,
      subtitle: entry.subtitle,
      body: entry.body,
      imageUrl: entry.imageUrl,
      sortOrder: entry.sortOrder,
    })),
  };
}

export async function siteRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/public/site", async () => ({ site: toPublic(await getSiteContent()) }));

  app.get("/api/site", { preHandler: [app.authenticate] }, async () => {
    return { site: toPublic(await getSiteContent()) };
  });

  app.put("/api/site", { preHandler: [app.authenticate] }, async (request) => {
    const body = saveSiteBody.parse(request.body);
    return { site: toPublic(await saveSiteContent(body)) };
  });

  app.post("/api/site/hero", { preHandler: [app.authenticate] }, async (request, reply) => {
    const file = await request.file();
    if (!file) {
      throw new AppError(400, "VALIDATION_ERROR", "Attach an image under the image field");
    }
    const buffer = await file.toBuffer();
    const site = toPublic(await setHeroImage({ filename: file.filename, buffer }));
    return reply.code(201).send({ site });
  });

  app.delete("/api/site/hero", { preHandler: [app.authenticate] }, async () => {
    return { site: toPublic(await clearHeroImage()) };
  });
}
