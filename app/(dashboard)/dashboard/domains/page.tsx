"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WebsiteDomainSummaryCard } from "@/components/dashboard/WebsiteDomainSummaryCard";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import { Alert } from "@/components/ui/Alert";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { publishBaseDomain } from "@/lib/publish-host";
import * as websitesApi from "@/services/websites.api";
import type { Website } from "@/types/website";

export default function DashboardDomainsPage() {
  const { currentWorkspace } = useWorkspace();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseDomain = publishBaseDomain();

  const load = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const res = await websitesApi.listWebsites(currentWorkspace.id);
      setWebsites(res.data.websites);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to load domains"
      );
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <WorkspaceRequired>
      <DashboardPageHeader
        title="Domains"
        description={
          currentWorkspace
            ? `SafNom addresses for websites in ${currentWorkspace.name}`
            : undefined
        }
      />

      <section
        className="dashboard-panel mb-6 max-w-6xl overflow-hidden border-2 border-brand/20 bg-gradient-to-br from-brand/[0.05] via-card to-card"
        aria-labelledby="platform-domain-heading"
      >
        <div className="border-b border-card-border px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            Your platform domain
          </p>
          <h2
            id="platform-domain-heading"
            className="mt-1 font-mono text-lg font-semibold tracking-tight"
          >
            *.{baseDomain}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Each website gets its own subdomain on this domain (for example{" "}
            <span className="font-mono text-xs text-foreground">
              my-shop.{baseDomain}
            </span>
            ). You can view and change subdomains anytime below.
          </p>
        </div>
        <div className="space-y-2 px-5 py-3 text-xs leading-relaxed text-muted">
          <p>
            Subdomains like <span className="font-mono">apexflow.{baseDomain}</span>{" "}
            are created in SafNom when you go live — not as separate rows in
            GoDaddy Forwarding.
          </p>
          <p>
            GoDaddy needs a one-time wildcard DNS record (
            <span className="font-mono">*</span>) pointing to your frontend host,
            plus <span className="font-mono">*.{baseDomain}</span> on Render.
          </p>
          <p>
            Custom domains (your own .com) are planned —{" "}
            <Link href="/domains" className="font-medium text-brand hover:underline">
              learn more
            </Link>
            .
          </p>
        </div>
      </section>

      {loading ? (
        <div className="dashboard-panel max-w-6xl p-8 text-sm text-muted">
          Loading your domains…
        </div>
      ) : error ? (
        <div className="max-w-6xl">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : websites.length === 0 ? (
        <div className="dashboard-panel max-w-6xl p-8">
          <p className="text-muted">
            No websites yet. Create a website first, then assign a subdomain
            here.
          </p>
          <Link
            href="/dashboard/websites"
            className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
          >
            Go to Websites →
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl">
          <h2 className="mb-4 text-sm font-semibold text-muted">
            Website subdomains ({websites.length})
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {websites.map((site) => (
              <WebsiteDomainSummaryCard
                key={site.id}
                website={site}
                baseDomain={baseDomain}
              />
            ))}
          </div>
        </div>
      )}
    </WorkspaceRequired>
  );
}
