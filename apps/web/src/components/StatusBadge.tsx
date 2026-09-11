import type { ProjectStatus } from "../types";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const tone =
    status === "published"
      ? "bg-moss text-paper"
      : status === "scheduled"
        ? "bg-clay text-white"
        : "bg-sand text-ink-soft";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase ${tone}`}>
      {status}
    </span>
  );
}
