"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { publishBaseDomain } from "@/lib/publish-host";
import { confirmAction } from "@/lib/confirm";
import { notify, notifyApiError } from "@/lib/notify";
import * as publishingApi from "@/services/publishing.api";
import * as websitesApi from "@/services/websites.api";
import type { Website } from "@/types/website";

export default function WebsiteDetailPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const [website, setWebsite] = useState<Website | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [platformDomain, setPlatformDomain] = useState(() =>
    publishBaseDomain()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseDomain = platformDomain;

  const load = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const [siteRes, pubRes] = await Promise.all([
        websitesApi.getWebsite(currentWorkspace.id, websiteId),
        publishingApi.getPublishingState(currentWorkspace.id, websiteId),
      ]);
      setWebsite(siteRes.data);
      setName(siteRes.data.name);
      setDescription(siteRes.data.description ?? "");
      setSubdomain(
        pubRes.data.subdomain ?? siteRes.data.subdomain ?? siteRes.data.slug
      );
      setPublicUrl(pubRes.data.publicUrl);
      setHasUnpublishedChanges(pubRes.data.hasUnpublishedChanges);
      setPlatformDomain(
        pubRes.data.platformDomain ?? publishBaseDomain()
      );
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to load website"
      );
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, websiteId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentWorkspace) return;
    setSaving(true);
    setError(null);
    try {
      const res = await websitesApi.updateWebsite(
        currentWorkspace.id,
        websiteId,
        {
          name: name.trim(),
          description: description.trim() || null,
        }
      );
      setWebsite(res.data);
      await publishingApi.updateSubdomain(
        currentWorkspace.id,
        websiteId,
        subdomain.trim()
      );
      await load();
      notify.success("Website settings saved.");
    } catch (err) {
      notifyApiError(err, "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    if (!currentWorkspace) return;
    setPublishing(true);
    try {
      const res = await publishingApi.publishWebsite(
        currentWorkspace.id,
        websiteId,
        subdomain.trim()
      );
      setPublicUrl(res.data.publicUrl);
      setHasUnpublishedChanges(false);
      await load();
      notify.success("Website published.");
    } catch (err) {
      notifyApiError(err, "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  async function onUnpublish() {
    if (!currentWorkspace) return;
    if (
      !(await confirmAction({
        title: "Unpublish website?",
        message:
          "Visitors will no longer see this site at its Safnom address. Your draft is kept.",
        confirmLabel: "Unpublish",
        tone: "danger",
      }))
    ) {
      return;
    }
    setPublishing(true);
    try {
      await publishingApi.unpublishWebsite(currentWorkspace.id, websiteId);
      setPublicUrl(null);
      await load();
      notify.success("Website unpublished.");
    } catch (err) {
      notifyApiError(err, "Unpublish failed");
    } finally {
      setPublishing(false);
    }
  }

  async function onDelete() {
    if (!currentWorkspace || !website) return;
    if (
      !(await confirmAction({
        title: "Delete website?",
        message: `Delete "${website.name}"? This cannot be undone.`,
        confirmLabel: "Delete",
        tone: "danger",
      }))
    ) {
      return;
    }
    try {
      await websitesApi.deleteWebsite(currentWorkspace.id, websiteId);
      router.push("/dashboard/websites");
    } catch (err) {
      notifyApiError(err, "Delete failed");
    }
  }

  return (
    <WorkspaceRequired>
      <div className="max-w-lg">
        <Link
          href="/dashboard/websites"
          className="mb-4 inline-block text-sm text-muted hover:text-brand"
        >
          ← Websites
        </Link>

        {loading ? (
          <div className="dashboard-panel p-8 text-sm text-muted">Loading…</div>
        ) : !website ? (
          <Alert tone="error">{error ?? "Website not found"}</Alert>
        ) : (
          <>
            <DashboardPageHeader
              title={website.name}
              description={`Workspace slug: ${website.slug}`}
              actions={<WebsiteStatusBadge status={website.status} />}
            />

            <div className="dashboard-panel mb-6 space-y-3 p-5">
              <dl className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-muted">Website ID:</dt>
                  <dd className="font-mono text-xs font-semibold tracking-wide">
                    {website.publicId}
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-muted">Published version:</dt>
                  <dd>{website.publishedVersion || "—"}</dd>
                </div>
                {publicUrl ? (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted">Live URL:</dt>
                    <dd>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline"
                      >
                        {publicUrl.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {hasUnpublishedChanges ? (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Draft has changes not yet on the live site — publish again to
                    update.
                  </p>
                ) : null}
              </dl>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              <Link
                href={`/dashboard/websites/${websiteId}/editor`}
                className="btn-primary rounded-lg px-3 py-2 text-xs"
              >
                Edit Website
              </Link>
              <Link
                href={`/dashboard/websites/${websiteId}/preview`}
                className="btn-secondary rounded-lg px-3 py-2 text-xs"
              >
                Preview draft
              </Link>
              <Link
                href={`/dashboard/websites/${websiteId}/pages`}
                className="btn-secondary rounded-lg px-3 py-2 text-xs"
              >
                Pages
              </Link>
              {website.status === "PUBLISHED" ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={publishing}
                  onClick={() => void onUnpublish()}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={publishing}
                  onClick={() => void onPublish()}
                >
                  {publishing ? "Publishing…" : "Publish"}
                </Button>
              )}
              {website.status === "PUBLISHED" ? (
                <Button
                  type="button"
                  disabled={publishing || !hasUnpublishedChanges}
                  onClick={() => void onPublish()}
                >
                  {publishing ? "Publishing…" : "Republish"}
                </Button>
              ) : null}
            </div>

            <form
              onSubmit={(e) => void onSave(e)}
              className="dashboard-panel space-y-4 p-6"
            >
              {error ? <Alert tone="error">{error}</Alert> : null}
              <div>
                <FieldLabel htmlFor="website-name">Name</FieldLabel>
                <Input
                  id="website-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel htmlFor="website-subdomain">Safnom subdomain</FieldLabel>
                <div className="flex items-center gap-1 text-sm">
                  <Input
                    id="website-subdomain"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    className="font-mono"
                  />
                  <span className="shrink-0 text-muted">.{baseDomain}</span>
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  Used for your public address (e.g. business.{baseDomain}).
                  Reserved names like admin or www cannot be used.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="text-red-600 dark:text-red-400"
                  onClick={() => void onDelete()}
                >
                  Delete website
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </WorkspaceRequired>
  );
}
