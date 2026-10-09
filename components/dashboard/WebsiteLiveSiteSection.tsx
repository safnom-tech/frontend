"use client";

import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import {
  buildLiveSiteUrl,
  validateSubdomainFormat,
} from "@/lib/subdomain";
import type { WebsiteStatus } from "@/types/website";

type Props = {
  websiteName: string;
  baseDomain: string;
  status: WebsiteStatus;
  subdomainInput: string;
  onSubdomainChange: (value: string) => void;
  committedSubdomain: string | null;
  publicUrl: string | null;
  hasUnpublishedChanges: boolean;
  publishing: boolean;
  savingSubdomain: boolean;
  onGoLive: () => void;
  onSaveSubdomain: () => void;
  onUnpublish: () => void;
  onRepublish: () => void;
  websiteId: string;
  subdomainPlaceholder?: string;
  compact?: boolean;
  className?: string;
};

export function WebsiteLiveSiteSection({
  websiteName,
  baseDomain,
  status,
  subdomainInput,
  onSubdomainChange,
  committedSubdomain,
  publicUrl,
  hasUnpublishedChanges,
  publishing,
  savingSubdomain,
  onGoLive,
  onSaveSubdomain,
  onUnpublish,
  onRepublish,
  websiteId,
  subdomainPlaceholder = "my-business",
  compact = false,
  className = "",
}: Props) {
  const validation = validateSubdomainFormat(subdomainInput);
  const previewUrl = validation.ok
    ? buildLiveSiteUrl(subdomainInput, baseDomain)
    : "";
  const isPublished = status === "PUBLISHED";
  const needsFirstSubdomain =
    !isPublished && !committedSubdomain?.trim();
  const subdomainChanged =
    validation.ok &&
    (committedSubdomain ?? "") !== validation.normalized;

  return (
    <section
      id="domain"
      className={`dashboard-panel mb-6 overflow-hidden border-2 border-brand/25 bg-gradient-to-br from-brand/[0.06] via-card to-card ${className}`.trim()}
      aria-labelledby="domain-section-heading"
    >
      <div className="border-b border-card-border bg-card/80 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Domain
            </p>
            <h2
              id="domain-section-heading"
              className="mt-1 text-lg font-semibold tracking-tight"
            >
              {websiteName}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Subdomain on{" "}
              <span className="font-mono text-xs">{baseDomain}</span> — view
              details here anytime and change the subdomain when you need to.
            </p>
          </div>
          <WebsiteStatusBadge status={status} />
        </div>
      </div>

      <div className="p-5 xl:grid xl:grid-cols-2 xl:gap-8 xl:gap-y-4">
        <div className="space-y-4 xl:min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Public address
          </p>
          {needsFirstSubdomain ? (
            <Alert tone="warning">
              Choose a subdomain, then Go live. Until then, only you can see the
              draft in the editor.
            </Alert>
          ) : null}

          {isPublished && publicUrl ? (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                Currently live
              </p>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block break-all font-mono text-sm font-medium text-brand hover:underline"
              >
                {publicUrl.replace(/^https?:\/\//, "")}
              </a>
            </div>
          ) : committedSubdomain && validation.ok ? (
            <div className="rounded-xl border border-card-border bg-background/80 px-4 py-3">
              <p className="text-xs text-muted">Reserved address (not live yet)</p>
              <p className="mt-1 font-mono text-sm">{previewUrl}</p>
            </div>
          ) : null}

          {hasUnpublishedChanges && isPublished ? (
            <Alert tone="info">
              Editor changes are not on the live site yet — use Republish after
              you finish editing.
            </Alert>
          ) : null}

          <p className="text-xs leading-relaxed text-muted">
            Visitors open{" "}
            <span className="font-mono text-[11px] text-foreground">
              https://your-name.{baseDomain}
            </span>
            . SafNom reads the hostname and serves your published site.
          </p>
        </div>

        <div className="mt-4 space-y-4 border-t border-card-border pt-4 xl:mt-0 xl:border-t-0 xl:pt-0">
          <div>
            <FieldLabel htmlFor="website-live-subdomain">Subdomain</FieldLabel>
            <div className="flex max-w-xl items-center gap-2 text-sm sm:max-w-none">
              <Input
                id="website-live-subdomain"
                value={subdomainInput}
                onChange={(e) => onSubdomainChange(e.target.value)}
                className="min-w-0 flex-1 font-mono"
                placeholder={subdomainPlaceholder}
                aria-invalid={!validation.ok}
              />
              <span className="shrink-0 text-muted">.{baseDomain}</span>
            </div>
            {!validation.ok ? (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                {validation.message}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-muted">
                Will resolve to{" "}
                <span className="font-mono text-foreground">{previewUrl}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 xl:border-t xl:border-card-border xl:pt-4">
          {subdomainChanged && validation.ok ? (
            <Button
              type="button"
              variant="secondary"
              disabled={savingSubdomain || publishing}
              onClick={onSaveSubdomain}
            >
              {savingSubdomain ? "Saving…" : "Save subdomain"}
            </Button>
          ) : null}

          {!isPublished ? (
            <Button
              type="button"
              disabled={publishing || !validation.ok}
              onClick={onGoLive}
            >
              {publishing ? "Going live…" : "Go live"}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={publishing || savingSubdomain}
                onClick={onUnpublish}
              >
                Unpublish
              </Button>
              <Button
                type="button"
                disabled={
                  publishing || savingSubdomain || !hasUnpublishedChanges || !validation.ok
                }
                onClick={onRepublish}
              >
                {publishing ? "Publishing…" : "Republish"}
              </Button>
            </>
          )}

          {!compact ? (
            <>
              <Link
                href={`/dashboard/websites/${websiteId}/editor`}
                className="btn-secondary rounded-lg px-3 py-2 text-xs"
              >
                Edit website
              </Link>
              <Link
                href={`/dashboard/websites/${websiteId}/preview`}
                className="btn-secondary rounded-lg px-3 py-2 text-xs"
              >
                Preview draft
              </Link>
            </>
          ) : (
            <Link
              href={`/dashboard/websites/${websiteId}`}
              className="btn-secondary rounded-lg px-3 py-2 text-xs"
            >
              All website settings
            </Link>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
