import { loadConfig } from "./config.js";
import { sql } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { seedAdminIfEmpty } from "./modules/auth/service.js";
import { buildApp } from "./app.js";

async function main() {
  const config = loadConfig();
  await runMigrations();
  await seedAdminIfEmpty();

  const app = await buildApp();
  await app.listen({ port: config.port, host: "0.0.0.0" });
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
