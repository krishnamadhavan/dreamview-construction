import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import secureSession from "@fastify/secure-session";
import fastifyStatic from "@fastify/static";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Fastify, { type FastifyError } from "fastify";
import { ZodError } from "zod";
import { loadConfig } from "./config.js";
import { sql } from "./db/client.js";
import { AppError, unauthorized } from "./lib/errors.js";
import { authRoutes } from "./modules/auth/routes.js";
import { projectRoutes } from "./modules/projects/routes.js";
import { MAX_IMAGE_BYTES, MAX_IMAGES_PER_PROJECT, storageReady } from "./storage/s3.js";

const here = dirname(fileURLToPath(import.meta.url));

function webDistDir(): string | undefined {
  const candidates = [
    process.env.WEB_DIST,
    resolve(here, "../../web/dist"),
    resolve(here, "../../../apps/web/dist"),
  ].filter((value): value is string => Boolean(value));
  return candidates.find((dir) => existsSync(dir));
}

export async function buildApp() {
  const config = loadConfig();
  const app = Fastify({
    logger: {
      level: config.isProd ? "info" : "debug",
      transport: config.isProd
        ? undefined
        : {
            target: "pino-pretty",
            options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" },
          },
    },
    trustProxy: true,
  });

  await app.register(cors, {
    origin: config.isProd ? false : ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  });
  await app.register(cookie);
  await app.register(secureSession, {
    key: createHash("sha256").update(config.sessionSecret).digest(),
    cookieName: "dv_session",
    cookie: {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: config.isProd,
    },
  });
  await app.register(multipart, {
    limits: {
      fileSize: MAX_IMAGE_BYTES,
      files: MAX_IMAGES_PER_PROJECT,
    },
  });

  app.decorate("authenticate", async (request) => {
    const adminId = request.session.get("adminId");
    const email = request.session.get("email");
    if (!adminId || !email) {
      throw unauthorized();
    }
    request.admin = { id: adminId, email };
  });

  app.setErrorHandler((error: FastifyError | ZodError | AppError, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request is invalid",
          details: error.issues,
        },
      });
    }

    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        error: { code: error.code, message: error.message, details: error.details },
      });
    }

    const statusCode = "statusCode" in error ? error.statusCode : 500;
    if (statusCode === 413) {
      return reply.code(413).send({
        error: {
          code: "FILE_TOO_LARGE",
          message: `Each image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)} MB`,
        },
      });
    }

    request.log.error(error);
    const message = config.isProd ? "Unexpected error" : error.message;
    return reply.code(statusCode && statusCode >= 400 ? statusCode : 500).send({
      error: { code: "INTERNAL_ERROR", message },
    });
  });

  app.get("/api/health", async () => {
    let database = false;
    try {
      await sql`SELECT 1`;
      database = true;
    } catch {
      database = false;
    }
    const storage = await storageReady();
    const ok = database && storage;
    return { ok, database, storage };
  });

  await app.register(authRoutes);
  await app.register(projectRoutes);

  if (config.isProd) {
    const dist = webDistDir();
    if (!dist) {
      throw new Error("Built admin UI not found. Run pnpm build before starting in production.");
    }
    await app.register(fastifyStatic, { root: dist, wildcard: false });
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api")) {
        return reply.code(404).send({
          error: { code: "NOT_FOUND", message: "Not found" },
        });
      }
      return reply.sendFile("index.html");
    });
  }

  return app;
}
