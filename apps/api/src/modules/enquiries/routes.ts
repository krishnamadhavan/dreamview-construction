import type { FastifyInstance } from "fastify";
import { createEnquiryBody, enquiryIdParam } from "./schemas.js";
import { assertEnquiryRate, createEnquiry, deleteEnquiry, listEnquiries, markEnquiryRead } from "./service.js";

function toAdmin(row: {
  id: string;
  name: string;
  email: string;
  phone: string;
  site: string;
  brief: string;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    site: row.site,
    brief: row.brief,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function enquiryRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/public/enquire", async (request, reply) => {
    const body = createEnquiryBody.parse(request.body);
    if (body.company.trim()) {
      return reply.code(201).send({ ok: true });
    }
    assertEnquiryRate(request.ip || "unknown");
    await createEnquiry({
      name: body.name,
      email: body.email,
      phone: body.phone,
      site: body.site,
      brief: body.brief,
    });
    return reply.code(201).send({ ok: true });
  });

  app.get("/api/enquiries", { preHandler: [app.authenticate] }, async () => {
    const { enquiries, unread } = await listEnquiries();
    return { enquiries: enquiries.map(toAdmin), unread };
  });

  app.patch("/api/enquiries/:id", { preHandler: [app.authenticate] }, async (request) => {
    const { id } = enquiryIdParam.parse(request.params);
    return { enquiry: toAdmin(await markEnquiryRead(id)) };
  });

  app.delete("/api/enquiries/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = enquiryIdParam.parse(request.params);
    await deleteEnquiry(id);
    return reply.code(204).send();
  });
}
