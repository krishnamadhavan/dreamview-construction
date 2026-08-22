import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadConfig } from "../config.js";
import * as schema from "./schema.js";

const config = loadConfig();

export const sql = postgres(config.databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 15,
});

export const db = drizzle(sql, { schema });
