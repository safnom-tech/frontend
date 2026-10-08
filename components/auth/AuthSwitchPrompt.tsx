import Link from "next/link";

export function AuthSwitchPrompt({
  prompt,
  actionLabel,
  href,
}: {
  prompt: string;
  actionLabel: string;
  href: string;
}) {
  return (
    <div className="auth-switch-prompt mt-6 rounded-xl border border-card-border bg-background/50 p-4 text-center text-sm">
      <span className="text-muted">{prompt} </span>
      <Link
        href={href}
        className="font-semibold text-brand hover:text-brand-deep dark:text-accent-soft dark:hover:text-brand-light"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
