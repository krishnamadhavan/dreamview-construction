import { setDefaultResultOrder } from "node:dns";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadDatabaseUrl } from "../config.js";
import * as schema from "./schema.js";

// Neon publishes AAAA records that this network cannot reach.
setDefaultResultOrder("ipv4first");

export const sql = postgres(loadDatabaseUrl(), {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  ssl: "require",
});

export const db = drizzle(sql, { schema });
