"use client";

import Link from "next/link";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { buildLiveSiteUrl } from "@/lib/subdomain";
import type { Website } from "@/types/website";

type Props = {
  website: Website;
  baseDomain: string;
};

export function WebsiteDomainSummaryCard({ website, baseDomain }: Props) {
  const subdomain = website.subdomain?.trim() || null;
  const isLive = website.status === "PUBLISHED" && Boolean(subdomain);
  const hostname = subdomain
    ? `${subdomain}.${baseDomain.replace(/^\./, "")}`
    : null;
  const publicUrl = subdomain ? buildLiveSiteUrl(subdomain, baseDomain) : null;

  return (
    <article className="dashboard-panel overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-card-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{website.name}</h2>
          <p className="mt-0.5 font-mono text-xs text-muted">{website.slug}</p>
        </div>
        <WebsiteStatusBadge status={website.status} />
      </div>

      <dl className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">
            Subdomain
          </dt>
          <dd className="mt-1 font-mono text-sm">
            {subdomain ?? (
              <span className="text-muted">Not chosen yet</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">
            Platform domain
          </dt>
          <dd className="mt-1 font-mono text-sm">{baseDomain}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">
            Public address
          </dt>
          <dd className="mt-1">
            {isLive && publicUrl ? (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-sm font-medium text-brand hover:underline"
              >
                {hostname}
              </a>
            ) : hostname ? (
              <span className="break-all font-mono text-sm text-muted">
                {hostname}{" "}
                <span className="font-sans text-xs">(reserved, not live)</span>
              </span>
            ) : (
              <span className="text-muted">
                Pick a subdomain and go live to get a public URL.
              </span>
            )}
          </dd>
        </div>
        {website.status === "PUBLISHED" && website.hasUnpublishedChanges ? (
          <div className="sm:col-span-2">
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              Draft edits are not on the live site yet — republish from domain
              settings.
            </p>
          </div>
        ) : null}
      </dl>

      <div className="flex flex-wrap gap-2 border-t border-card-border px-5 py-4">
        <Link
          href={`/dashboard/websites/${website.id}/live`}
          className="btn-primary rounded-lg px-3 py-2 text-xs"
        >
          Manage subdomain
        </Link>
        <Link
          href={`/dashboard/websites/${website.id}`}
          className="btn-secondary rounded-lg px-3 py-2 text-xs"
        >
          Website settings
        </Link>
      </div>
    </article>
  );
}
