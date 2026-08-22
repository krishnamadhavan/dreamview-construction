import type { FastifyInstance } from "fastify";
import { AppError } from "../../lib/errors.js";
import {
  createProjectBody,
  idParam,
  imageParam,
  reorderImagesBody,
  updateImageBody,
  updateProjectBody,
} from "./schemas.js";
import {
  addImages,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeImage,
  reorderImages,
  updateImage,
  updateProject,
} from "./service.js";

export async function projectRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/projects", { preHandler: [app.authenticate] }, async () => {
    return { projects: await listProjects() };
  });

  app.get("/api/projects/:id", { preHandler: [app.authenticate] }, async (request) => {
    const { id } = idParam.parse(request.params);
    return { project: await getProject(id) };
  });

  app.post("/api/projects", { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = createProjectBody.parse(request.body);
    const project = await createProject(body);
    return reply.code(201).send({ project });
  });

  app.patch("/api/projects/:id", { preHandler: [app.authenticate] }, async (request) => {
    const { id } = idParam.parse(request.params);
    const body = updateProjectBody.parse(request.body);
    return { project: await updateProject(id, body) };
  });

  app.delete("/api/projects/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = idParam.parse(request.params);
    await deleteProject(id);
    return reply.code(204).send();
  });

  app.post("/api/projects/:id/images", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = idParam.parse(request.params);
    const files: Array<{ filename: string; mimetype: string; buffer: Buffer }> = [];

    const parts = request.parts();
    for await (const part of parts) {
      if (part.type !== "file") continue;
      const buffer = await part.toBuffer();
      files.push({
        filename: part.filename,
        mimetype: part.mimetype,
        buffer,
      });
    }

    if (files.length === 0) {
      throw new AppError(400, "VALIDATION_ERROR", "Attach one or more files under the images field");
    }

    const images = await addImages(id, files);
    return reply.code(201).send({ images });
  });

  app.patch("/api/projects/:id/images/:imageId", { preHandler: [app.authenticate] }, async (request) => {
    const { id, imageId } = imageParam.parse(request.params);
    const body = updateImageBody.parse(request.body);
    return { image: await updateImage(id, imageId, body) };
  });

  app.put("/api/projects/:id/images/order", { preHandler: [app.authenticate] }, async (request) => {
    const { id } = idParam.parse(request.params);
    const body = reorderImagesBody.parse(request.body);
    return { images: await reorderImages(id, body.imageIds) };
  });

  app.delete("/api/projects/:id/images/:imageId", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id, imageId } = imageParam.parse(request.params);
    await removeImage(id, imageId);
    return reply.code(204).send();
  });
}
