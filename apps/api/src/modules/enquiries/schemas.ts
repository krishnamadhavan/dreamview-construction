import { z } from "zod";

export const createEnquiryBody = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(80).default(""),
  site: z.string().trim().min(1).max(200),
  brief: z.string().trim().min(1).max(8_000),
  company: z.string().max(200).optional().default(""),
});

export const enquiryIdParam = z.object({
  id: z.string().uuid(),
});
