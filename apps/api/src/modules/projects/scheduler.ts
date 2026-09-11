import { publishDueProjects } from "./service.js";

// Backup only. Free cron should hit /api/cron/publish every 10 minutes so
// Render stays awake. Do not poll Postgres every 30s or Neon never sleeps.
const INTERVAL_MS = 10 * 60 * 1000;

export function startPublishScheduler(): void {
  void tick();
  const timer = setInterval(() => {
    void tick();
  }, INTERVAL_MS);
  timer.unref();
}

async function tick(): Promise<void> {
  try {
    const count = await publishDueProjects();
    if (count > 0) {
      console.log(`published ${count} scheduled project${count === 1 ? "" : "s"}`);
    }
  } catch (error) {
    console.error("scheduled publish job failed", error);
  }
}
