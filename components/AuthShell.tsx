import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export type AuthShellVariant = "login" | "signup" | "default";

const badges: Record<AuthShellVariant, string> = {
  login: "Welcome back",
  signup: "Get started free",
  default: "SafNom account",
};

export function AuthShell({
  title,
  subtitle,
  variant = "default",
  badge,
  children,
  footer,
}: {
  title: ReactNode;
  subtitle?: string;
  variant?: AuthShellVariant;
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const badgeText = badge ?? badges[variant];

  return (
    <div className="page-mesh flex min-h-full flex-col">
      <SiteHeader />

      <section className="flex flex-1 flex-col items-center px-6 pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto mb-8 max-w-lg space-y-4 text-center">
          <p className="badge-brand inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
            {badgeText}
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mx-auto max-w-md text-base leading-relaxed text-muted sm:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="auth-form-card w-full max-w-md overflow-hidden rounded-2xl">
          <div className="auth-form-accent h-1 w-full" aria-hidden />
          <div className="space-y-6 p-8 sm:p-9">{children}</div>
        </div>

        {footer ? (
          <div className="mt-6 w-full max-w-md text-center text-sm text-muted">
            {footer}
          </div>
        ) : null}
      </section>
    </div>
  );
}
