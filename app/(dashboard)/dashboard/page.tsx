"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { Alert } from "@/components/ui/Alert";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as websitesApi from "@/services/websites.api";
import type { Website } from "@/types/website";

export default function DashboardHomePage() {
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workspaceId = currentWorkspace?.id;

  const load = useCallback(async () => {
    if (!workspaceId) {
      setWebsites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await websitesApi.listWebsites(workspaceId);
      setWebsites(res.data.websites);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to load websites"
      );
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="text-foreground">
      <DashboardPageHeader
        title="Dashboard"
        description={
          currentWorkspace
            ? `You're working in ${currentWorkspace.name}. Select a website below or create a new one.`
            : "Select or create a workspace to get started."
        }
        actions={
          currentWorkspace ? (
            <Link
              href="/dashboard/websites/new"
              className="btn-primary rounded-lg px-4 py-2 text-sm"
            >
              Create website
            </Link>
          ) : null
        }
      />

      {!workspaceLoading && !currentWorkspace ? (
        <div className="dashboard-panel max-w-lg p-8">
          <h2 className="text-lg font-semibold">Set up a workspace</h2>
          <p className="mt-2 text-sm text-muted">
            Websites belong to a workspace. Create one to continue.
          </p>
          <Link
            href="/dashboard/workspace"
            className="btn-primary mt-6 inline-flex rounded-lg px-4 py-2 text-sm"
          >
            Open workspace settings
          </Link>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      {currentWorkspace ? (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Your websites
          </h2>

          {loading ? (
            <div className="dashboard-panel p-8 text-sm text-muted">
              Loading websites…
            </div>
          ) : websites.length === 0 ? (
            <div className="dashboard-panel p-10 text-center">
              <p className="text-base font-semibold">No websites yet</p>
              <p className="mt-2 text-sm text-muted">
                Start with the Fashion Storefront design — preview it, then edit
                text and images in the visual builder.
              </p>
              <Link
                href="/dashboard/websites/new"
                className="btn-primary mt-5 inline-flex rounded-lg px-5 py-2.5 text-sm"
              >
                Create website
              </Link>
            </div>
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {websites.map((site) => (
                <li key={site.id} className="dashboard-panel flex flex-col p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/dashboard/websites/${site.id}`}
                        className="text-lg font-semibold hover:text-brand"
                      >
                        {site.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted">/{site.slug}</p>
                    </div>
                    <WebsiteStatusBadge status={site.status} />
                  </div>

                  <dl className="mt-4 space-y-1.5 text-sm">
                    {site.publicId ? (
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-muted">Website ID:</dt>
                        <dd className="font-mono text-xs font-medium tracking-wide">
                          {site.publicId}
                        </dd>
                      </div>
                    ) : null}
                    {site.subscriptionId ? (
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-muted">Subscription:</dt>
                        <dd className="font-mono text-xs font-medium tracking-wide">
                          {site.subscriptionId}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/websites/${site.id}/editor`}
                      className="btn-primary rounded-lg px-3 py-2 text-xs"
                    >
                      Edit Website
                    </Link>
                    <Link
                      href={`/dashboard/websites/${site.id}/preview`}
                      className="btn-secondary rounded-lg px-3 py-2 text-xs"
                    >
                      Preview
                    </Link>
                    <Link
                      href={`/dashboard/websites/${site.id}`}
                      className="btn-secondary rounded-lg px-3 py-2 text-xs"
                    >
                      Details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <Link
              href="/dashboard/websites/new"
              className="dashboard-panel block p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-semibold text-brand">+ New website</p>
              <p className="mt-1 text-sm text-muted">
                Choose Fashion Storefront (recommended) or another template, then
                edit in the builder.
              </p>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
