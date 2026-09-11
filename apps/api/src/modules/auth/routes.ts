import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AppError, unauthorized } from "../../lib/errors.js";
import { authenticate } from "./service.js";

const LOGIN_FAILED = "Invalid email or password";

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function throttle(ip: string): void {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  current.count += 1;
  if (current.count > MAX_ATTEMPTS) {
    throw unauthorized("Too many sign-in attempts. Try again later.");
  }
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/auth/login", async (request, reply) => {
    throttle(request.ip);
    const body = loginBody.parse(request.body);
    try {
      const admin = await authenticate(body.email, body.password);
      request.session.set("adminId", admin.id);
      request.session.set("email", admin.email);
      return reply.send({ admin });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 401) {
        throw unauthorized(LOGIN_FAILED);
      }
      request.log.error(error);
      throw unauthorized(LOGIN_FAILED);
    }
  });

  app.post("/api/auth/logout", async (request, reply) => {
    request.session.delete();
    return reply.send({ ok: true });
  });

  app.get("/api/auth/me", async (request, reply) => {
    const adminId = request.session.get("adminId");
    const email = request.session.get("email");
    if (!adminId || !email) {
      throw unauthorized();
    }
    return reply.send({ admin: { id: adminId, email } });
  });
}
