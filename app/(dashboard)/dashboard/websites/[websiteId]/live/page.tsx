"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { WebsiteLiveSiteSection } from "@/components/dashboard/WebsiteLiveSiteSection";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import { Alert } from "@/components/ui/Alert";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { publishBaseDomain } from "@/lib/publish-host";
import { notify, notifyApiError } from "@/lib/notify";
import { validateSubdomainFormat } from "@/lib/subdomain";
import * as publishingApi from "@/services/publishing.api";
import * as websitesApi from "@/services/websites.api";
import type { Website } from "@/types/website";

export default function WebsiteLivePage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const { currentWorkspace } = useWorkspace();
  const [website, setWebsite] = useState<Website | null>(null);
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

  return (
    <WorkspaceRequired>
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link
            href="/dashboard/domains"
            className="text-muted hover:text-brand"
          >
            ← All domains
          </Link>
          <Link
            href={`/dashboard/websites/${websiteId}`}
            className="text-muted hover:text-brand"
          >
            Website settings
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-panel p-8 text-sm text-muted">Loading…</div>
        ) : error || !website ? (
          <Alert tone="error">{error ?? "Website not found"}</Alert>
        ) : (
          <>
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
              compact
            />
          </>
        )}
      </div>
    </WorkspaceRequired>
  );
}
