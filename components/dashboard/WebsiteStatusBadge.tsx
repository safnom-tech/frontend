import type { WebsiteStatus } from "@/types/website";

const styles: Record<WebsiteStatus, string> = {
  DRAFT: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  PUBLISHED: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  UNPUBLISHED: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
};

export function WebsiteStatusBadge({ status }: { status: WebsiteStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status.toLowerCase()}
    </span>
  );
}
