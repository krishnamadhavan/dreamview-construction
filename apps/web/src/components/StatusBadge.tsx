import type { ProjectStatus } from "../types";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase ${
        published ? "bg-moss text-paper" : "bg-sand text-ink-soft"
      }`}
    >
      {status}
    </span>
  );
}
