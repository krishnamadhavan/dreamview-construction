import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { loadConfig } from "../../config.js";
import { unauthorized } from "../../lib/errors.js";
import { publishDueProjects } from "./service.js";

function providedSecret(request: FastifyRequest): string {
  const header = request.headers["x-cron-secret"];
  if (typeof header === "string" && header.length > 0) return header;
  const auth = request.headers.authorization;
  if (typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return "";
}

function secretsMatch(expected: string, received: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(received);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function cronRoutes(app: FastifyInstance): Promise<void> {
  const handler = async (request: FastifyRequest) => {
    const secret = loadConfig().cronSecret;
    if (!secret || !secretsMatch(secret, providedSecret(request))) {
      throw unauthorized();
    }
    const published = await publishDueProjects();
    return { ok: true, published };
  };

  // GET so free cron services can call it; POST works too.
  app.get("/api/cron/publish", handler);
  app.post("/api/cron/publish", handler);
}
