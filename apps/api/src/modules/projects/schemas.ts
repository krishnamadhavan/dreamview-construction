import { z } from "zod";

export const projectStatusSchema = z.enum(["draft", "scheduled", "published"]);

const publishAtSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: "Invalid publish time" });

export const createProjectBody = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(20_000).default(""),
    status: projectStatusSchema.default("draft"),
    publishAt: publishAtSchema.nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "scheduled" && !value.publishAt) {
      ctx.addIssue({
        code: "custom",
        path: ["publishAt"],
        message: "A publish time is required when status is scheduled",
      });
    }
  });

export const updateProjectBody = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(20_000).optional(),
    status: projectStatusSchema.optional(),
    publishAt: publishAtSchema.nullable().optional(),
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
