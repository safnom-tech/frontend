type Tone = "error" | "success" | "info" | "warning";

const toneClass: Record<Tone, string> = {
  error:
    "border-red-200/80 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-950/50 dark:text-red-200",
  success:
    "border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-200",
  info:
    "border-sky-200/80 bg-sky-50 text-sky-900 dark:border-sky-500/20 dark:bg-sky-950/40 dark:text-sky-200",
  warning:
    "border-amber-200/80 bg-amber-50 text-amber-950 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-200",
};

export function Alert({ tone, children }: { tone: Tone; children: string }) {
  return (
    <p
      className={`rounded-xl border px-3 py-2.5 text-sm ${toneClass[tone]}`}
      role="alert"
    >
      {children}
    </p>
  );
}
