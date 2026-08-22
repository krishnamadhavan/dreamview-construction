import { access, readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../config.js";
import { sql } from "./client.js";

async function resolveMigrationsDir(): Promise<string> {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, "migrations"), join(here, "../../src/db/migrations")];
  for (const dir of candidates) {
    try {
      await access(dir);
      return dir;
    } catch {
      // try next
    }
  }
  throw new Error(`migrations directory not found (looked in ${candidates.join(", ")})`);
}

export async function runMigrations(): Promise<void> {
  loadConfig();
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const migrationsDir = await resolveMigrationsDir();
  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const applied = await sql`SELECT id FROM schema_migrations WHERE id = ${file}`;
    if (applied.length > 0) continue;

    const body = await readFile(join(migrationsDir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`INSERT INTO schema_migrations (id) VALUES (${file})`;
    });
    console.log(`applied migration ${file}`);
  }
}

const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirect) {
  runMigrations()
    .then(async () => {
      await sql.end();
      console.log("migrations complete");
    })
    .catch(async (error) => {
      console.error(error);
      await sql.end({ timeout: 1 });
      process.exit(1);
    });
}
