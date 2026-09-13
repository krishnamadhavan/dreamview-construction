import type { ProjectStatus } from "../types";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const tone =
    status === "published"
      ? "bg-gold text-void"
      : status === "scheduled"
        ? "border border-gold/50 text-gold"
        : "border border-white/15 text-paper/50";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase ${tone}`}>
      {status}
    </span>
  );
}
