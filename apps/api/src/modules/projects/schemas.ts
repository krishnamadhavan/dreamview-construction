import { z } from "zod";

export const projectStatusSchema = z.enum(["draft", "scheduled", "published"]);

export const projectKindSchema = z.enum([
  "residence",
  "interiors",
  "restoration",
  "structural",
  "civic",
  "other",
]);

const publishAtSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: "Invalid publish time" });

export const createProjectBody = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(20_000).default(""),
    location: z.string().trim().max(120).default(""),
    year: z.string().trim().max(20).default(""),
    kind: projectKindSchema.default("residence"),
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
    location: z.string().trim().max(120).optional(),
    year: z.string().trim().max(20).optional(),
    kind: projectKindSchema.optional(),
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
