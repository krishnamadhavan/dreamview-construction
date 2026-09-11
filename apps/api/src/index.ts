import { loadConfig } from "./config.js";
import { sql } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { seedAdminIfEmpty } from "./modules/auth/service.js";
import { startPublishScheduler } from "./modules/projects/scheduler.js";
import { buildApp } from "./app.js";

async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (attempt === attempts || (code !== "ETIMEDOUT" && code !== "ECONNREFUSED" && code !== "CONNECT_TIMEOUT")) {
        throw error;
      }
      const delayMs = attempt * 1500;
      console.warn(`${label} failed (${code || "error"}), retrying in ${delayMs}ms (${attempt}/${attempts})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

async function main() {
  const config = loadConfig();
  await withRetry("database", () => runMigrations());
  await seedAdminIfEmpty();

  const app = await buildApp();
  await app.listen({ port: config.port, host: "0.0.0.0" });
  startPublishScheduler();
}

main().catch(async (error) => {
  console.error(error);
  await sql.end({ timeout: 2 }).catch(() => undefined);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await sql.end({ timeout: 2 }).catch(() => undefined);
    process.exit(0);
  });
}
