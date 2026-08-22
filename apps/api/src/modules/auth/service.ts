import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { loadConfig } from "../../config.js";
import { db } from "../../db/client.js";
import { admins } from "../../db/schema.js";
import { unauthorized } from "../../lib/errors.js";

export async function seedAdminIfEmpty(): Promise<void> {
  const config = loadConfig();
  const [row] = await db.select({ value: count() }).from(admins);
  if ((row?.value ?? 0) > 0) return;

  const passwordHash = await bcrypt.hash(config.admin.password, 12);
  await db.insert(admins).values({
    email: config.admin.email,
    passwordHash,
  });
  console.log(`seeded admin ${config.admin.email}`);
}

export async function authenticate(email: string, password: string) {
  const admin = await db.query.admins.findFirst({
    where: eq(admins.email, email.toLowerCase()),
  });
  if (!admin) {
    throw unauthorized("Invalid email or password");
  }
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    throw unauthorized("Invalid email or password");
  }
  return { id: admin.id, email: admin.email };
}
