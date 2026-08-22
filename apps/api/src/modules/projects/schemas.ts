import { z } from "zod";

export const projectStatusSchema = z.enum(["draft", "published"]);

export const createProjectBody = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(20_000).default(""),
  status: projectStatusSchema.default("draft"),
});

export const updateProjectBody = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(20_000).optional(),
    status: projectStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const reorderImagesBody = z.object({
  imageIds: z.array(z.string().uuid()).min(1),
});

export const updateImageBody = z.object({
  alt: z.string().max(200),
});

export const idParam = z.object({
  id: z.string().uuid(),
});

export const imageParam = z.object({
  id: z.string().uuid(),
  imageId: z.string().uuid(),
});
