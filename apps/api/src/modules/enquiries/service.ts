import { desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { enquiries, type Enquiry } from "../../db/schema.js";
import { AppError, notFound } from "../../lib/errors.js";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function prune(now: number): void {
  if (hits.size < 200) return;
  for (const [key, times] of hits) {
    const next = times.filter((time) => now - time < WINDOW_MS);
    if (next.length === 0) hits.delete(key);
    else hits.set(key, next);
  }
}

export function assertEnquiryRate(ip: string): void {
  const now = Date.now();
  prune(now);
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    throw new AppError(429, "RATE_LIMITED", "Please wait before sending another brief");
  }
  recent.push(now);
  hits.set(ip, recent);
}

export async function createEnquiry(input: {
  name: string;
  email: string;
  phone: string;
  site: string;
  brief: string;
}): Promise<Enquiry> {
  const [row] = await db
    .insert(enquiries)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      site: input.site,
      brief: input.brief,
    })
    .returning();
  if (!row) throw new AppError(500, "CREATE_FAILED", "Could not save the brief");
  return row;
}

export async function listEnquiries(): Promise<{ enquiries: Enquiry[]; unread: number }> {
  const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  const [count] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(enquiries)
    .where(isNull(enquiries.readAt));
  return { enquiries: rows, unread: count?.value ?? 0 };
}

export async function markEnquiryRead(id: string): Promise<Enquiry> {
  const [row] = await db
    .update(enquiries)
    .set({ readAt: new Date() })
    .where(eq(enquiries.id, id))
    .returning();
  if (!row) throw notFound("Enquiry");
  return row;
}

export async function deleteEnquiry(id: string): Promise<void> {
  const deleted = await db.delete(enquiries).where(eq(enquiries.id, id)).returning({ id: enquiries.id });
  if (deleted.length === 0) throw notFound("Enquiry");
}
