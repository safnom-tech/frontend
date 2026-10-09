"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { WebsiteLiveSiteSection } from "@/components/dashboard/WebsiteLiveSiteSection";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { publishBaseDomain } from "@/lib/publish-host";
import { confirmAction } from "@/lib/confirm";
import { notify, notifyApiError } from "@/lib/notify";
import { validateSubdomainFormat } from "@/lib/subdomain";
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
  const [committedSubdomain, setCommittedSubdomain] = useState<string | null>(
    null
  );
  const [slugHint, setSlugHint] = useState("");
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [platformDomain, setPlatformDomain] = useState(() =>
    publishBaseDomain()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingSubdomain, setSavingSubdomain] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const [siteRes, pubRes] = await Promise.all([
        websitesApi.getWebsite(currentWorkspace.id, websiteId),
        publishingApi.getPublishingState(currentWorkspace.id, websiteId),
      ]);
      const committed =
        pubRes.data.subdomain ?? siteRes.data.subdomain ?? null;
      setWebsite(siteRes.data);
      setName(siteRes.data.name);
      setDescription(siteRes.data.description ?? "");
      setCommittedSubdomain(committed);
      setSlugHint(siteRes.data.slug);
      setSubdomain(committed ?? "");
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
      notify.success("Website settings saved.");
    } catch (err) {
      notifyApiError(err, "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onSaveSubdomain() {
    if (!currentWorkspace) return;
    const check = validateSubdomainFormat(subdomain);
    if (!check.ok) {
      notify.warning(check.message);
      return;
    }
    setSavingSubdomain(true);
    try {
      const res = await publishingApi.updateSubdomain(
        currentWorkspace.id,
        websiteId,
        check.normalized
      );
      setCommittedSubdomain(res.data.subdomain);
      setSubdomain(res.data.subdomain ?? check.normalized);
      setPublicUrl(res.data.publicUrl);
      await load();
      notify.success("Subdomain updated.");
    } catch (err) {
      notifyApiError(err, "Could not save subdomain");
    } finally {
      setSavingSubdomain(false);
    }
  }

  async function onPublish() {
    if (!currentWorkspace) return;
    const check = validateSubdomainFormat(subdomain);
    if (!check.ok) {
      notify.warning(check.message);
      return;
    }
    setPublishing(true);
    try {
      const res = await publishingApi.publishWebsite(
        currentWorkspace.id,
        websiteId,
        check.normalized
      );
      setPublicUrl(res.data.publicUrl);
      setCommittedSubdomain(res.data.subdomain);
      setSubdomain(res.data.subdomain ?? check.normalized);
      setHasUnpublishedChanges(false);
      await load();
      notify.success("Website is live.");
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
      <div className="mx-auto w-full max-w-6xl">
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

            {!committedSubdomain && slugHint ? (
              <p className="mb-4 text-sm text-muted">
                Suggested subdomain:{" "}
                <button
                  type="button"
                  className="font-mono text-brand hover:underline"
                  onClick={() => setSubdomain(slugHint)}
                >
                  {slugHint}
                </button>
              </p>
            ) : null}

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(16rem,1fr)] xl:gap-8">
              <div className="min-w-0 space-y-6">
                <WebsiteLiveSiteSection
                  websiteName={website.name}
                  baseDomain={platformDomain}
                  status={website.status}
                  subdomainInput={subdomain}
                  onSubdomainChange={setSubdomain}
                  committedSubdomain={committedSubdomain}
                  publicUrl={publicUrl}
                  hasUnpublishedChanges={hasUnpublishedChanges}
                  publishing={publishing}
                  savingSubdomain={savingSubdomain}
                  onGoLive={() => void onPublish()}
                  onSaveSubdomain={() => void onSaveSubdomain()}
                  onUnpublish={() => void onUnpublish()}
                  onRepublish={() => void onPublish()}
                  websiteId={websiteId}
                  subdomainPlaceholder={slugHint || "my-business"}
                  className="mb-0"
                />

                <form
                  onSubmit={(e) => void onSave(e)}
                  className="dashboard-panel space-y-4 p-6"
                >
                  <h2 className="text-base font-semibold tracking-tight">
                    General
                  </h2>
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
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
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
              </div>

              <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
                <div className="dashboard-panel space-y-3 p-5 text-sm">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Details
                  </h2>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-muted">Website ID</dt>
                      <dd className="mt-0.5 font-mono text-xs font-semibold tracking-wide">
                        {website.publicId}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Published version</dt>
                      <dd className="mt-0.5">{website.publishedVersion || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Platform domain</dt>
                      <dd className="mt-0.5 font-mono text-xs">{platformDomain}</dd>
                    </div>
                  </dl>
                </div>

                <nav className="dashboard-panel flex flex-col gap-1 p-3 text-sm">
                  <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    Shortcuts
                  </p>
                  <Link
                    href={`/dashboard/websites/${websiteId}/editor`}
                    className="rounded-lg px-2 py-2 font-medium hover:bg-[var(--dash-nav-hover)]"
                  >
                    Edit website
                  </Link>
                  <Link
                    href={`/dashboard/websites/${websiteId}/preview`}
                    className="rounded-lg px-2 py-2 font-medium hover:bg-[var(--dash-nav-hover)]"
                  >
                    Preview draft
                  </Link>
                  <Link
                    href={`/dashboard/websites/${websiteId}/live`}
                    className="rounded-lg px-2 py-2 font-medium hover:bg-[var(--dash-nav-hover)]"
                  >
                    Domain settings
                  </Link>
                  <Link
                    href="/dashboard/domains"
                    className="rounded-lg px-2 py-2 font-medium text-brand hover:bg-[var(--dash-nav-hover)]"
                  >
                    All workspace domains
                  </Link>
                </nav>
              </aside>
            </div>
          </>
        )}
      </div>
    </WorkspaceRequired>
  );
}
