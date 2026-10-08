"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { templateAccent } from "@/components/dashboard/TemplateDesignPreview";
import { LazyTemplateLivePreview } from "@/components/dashboard/LazyTemplateLivePreview";
import { WebsitePreviewCard } from "@/components/dashboard/WebsitePreviewCard";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { confirmAction } from "@/lib/confirm";
import { notify, notifyApiError } from "@/lib/notify";
import { hasBusinessName } from "@/types/business-profile";
import { createWebsiteFromTemplateAndOpenEditor } from "@/lib/createWebsiteFromTemplate";
import * as templatesApi from "@/services/templates.api";
import * as websitesApi from "@/services/websites.api";
import type { TemplateSummary } from "@/types/template";
import type { Website } from "@/types/website";

const TEMPLATE_PAGE_SIZE = 20;

export default function WebsitesListPage() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [templatesTotal, setTemplatesTotal] = useState(0);
  const [loadingMoreTemplates, setLoadingMoreTemplates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [hoverThemeId, setHoverThemeId] = useState<string | null>(null);

  const workspaceId = currentWorkspace?.id;
  const profileReady = hasBusinessName(currentWorkspace?.businessProfile);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const [sitesRes, templatesRes] = await Promise.all([
        websitesApi.listWebsites(workspaceId),
        templatesApi.listTemplates({ limit: TEMPLATE_PAGE_SIZE, offset: 0 }),
      ]);
      setWebsites(sitesRes.data.websites);
      setTemplates(templatesRes.data.templates);
      setTemplatesTotal(templatesRes.data.total);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to load websites"
      );
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  async function loadMoreTemplates() {
    if (loadingMoreTemplates || templates.length >= templatesTotal) return;
    setLoadingMoreTemplates(true);
    setError(null);
    try {
      const res = await templatesApi.listTemplates({
        limit: TEMPLATE_PAGE_SIZE,
        offset: templates.length,
      });
      setTemplates((prev) => [...prev, ...res.data.templates]);
      setTemplatesTotal(res.data.total);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to load more themes"
      );
    } finally {
      setLoadingMoreTemplates(false);
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(website: Website) {
    if (!workspaceId) return;
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
      await websitesApi.deleteWebsite(workspaceId, website.id);
      notify.success(`Deleted "${website.name}"`);
      await load();
    } catch (err) {
      notifyApiError(err, "Delete failed");
    }
  }

  async function useTemplate(
    template: TemplateSummary,
    options?: { openEditor?: boolean }
  ) {
    if (!workspaceId) return;
    setCreatingId(template.id);
    setError(null);
    try {
      if (options?.openEditor === false) {
        await websitesApi.createWebsite(workspaceId, {
          templateId: template.id,
        });
        await load();
        return;
      }
      await createWebsiteFromTemplateAndOpenEditor(
        workspaceId,
        template.id,
        router
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not create website from template"
      );
    } finally {
      setCreatingId(null);
    }
  }

  return (
    <WorkspaceRequired>
      <DashboardPageHeader
        title="Websites"
        description={
          currentWorkspace
            ? `Your selected sites in ${currentWorkspace.name}. Themes are listed separately below.`
            : undefined
        }
        actions={
          <a
            href="#themes"
            className="btn-primary rounded-lg px-4 py-2 text-sm"
          >
            Browse themes
          </a>
        }
      />

      {error ? (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      {!profileReady ? (
        <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Add your{" "}
          <Link href="/dashboard/business" className="font-semibold text-brand">
            business profile
          </Link>{" "}
          (name, logo, phone, social links) once — every theme you select will
          use those details automatically.
        </div>
      ) : null}

      {loading ? (
        <div className="dashboard-panel p-8 text-center text-sm text-muted">
          Loading…
        </div>
      ) : (
        <div className="space-y-12">
          {/* Account websites only */}
          <section aria-labelledby="your-websites-heading">
            <div className="mb-4">
              <h2
                id="your-websites-heading"
                className="text-lg font-semibold tracking-tight"
              >
                Your websites
              </h2>
              <p className="mt-1 text-sm text-muted">
                Only websites created for this account. Each card shows a live
                preview of the design.
              </p>
            </div>

            {websites.length === 0 ? (
              <div className="dashboard-panel p-8 text-center">
                <p className="font-medium">No websites selected yet</p>
                <p className="mt-2 text-sm text-muted">
                  Pick a theme in the Themes section below — it will appear here
                  with a preview.
                </p>
                <a
                  href="#themes"
                  className="btn-primary mt-5 inline-flex rounded-lg px-4 py-2 text-sm"
                >
                  Choose a theme
                </a>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {websites.map((site) => (
                  <WebsitePreviewCard
                    key={site.id}
                    workspaceId={workspaceId!}
                    website={site}
                    onDelete={() => void handleDelete(site)}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Themes only — separate section */}
          <section
            id="themes"
            aria-labelledby="themes-heading"
            className="scroll-mt-6 rounded-2xl border border-card-border bg-card/50 p-5 sm:p-6"
          >
            <div className="mb-5 border-b border-card-border pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                Themes
              </p>
              <h2
                id="themes-heading"
                className="mt-1 text-lg font-semibold tracking-tight"
              >
                Choose a website theme
              </h2>
              <p className="mt-1 text-sm text-muted">
                These are design templates — not your sites. Select one to create
                a website; it will show under Your websites with a preview.
              </p>
            </div>

            {templates.length === 0 ? (
              <p className="text-sm text-muted">
                No themes loaded.{" "}
                <Link href="/dashboard/websites/new" className="text-brand">
                  Create manually
                </Link>
              </p>
            ) : (
              <ul className="grid gap-5 md:grid-cols-2">
                {templates.map((template) => {
                  const featured = template.id === "ocean-crown";
                  const busy = creatingId === template.id;
                  return (
                    <li
                      key={template.id}
                      className={`dashboard-panel flex flex-col overflow-hidden bg-card ${
                        featured
                          ? "border-2 border-brand ring-2 ring-brand/30"
                          : ""
                      }`}
                      onMouseEnter={() => setHoverThemeId(template.id)}
                      onMouseLeave={() => setHoverThemeId(null)}
                    >
                      <div className="relative aspect-[16/11] min-h-[280px] overflow-hidden border-b border-card-border sm:min-h-[360px] lg:min-h-[420px]">
                        <LazyTemplateLivePreview
                          templateId={template.id}
                          className="h-full w-full"
                          hovering={hoverThemeId === template.id}
                        />
                        {featured ? (
                          <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Recommended
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="mt-0.5 text-xs text-muted">
                              {template.category}
                            </p>
                          </div>
                          <span
                            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: templateAccent(template) }}
                            aria-hidden
                          />
                        </div>
                        <p className="mt-2 line-clamp-2 flex-1 text-xs text-muted">
                          {template.description}
                        </p>
                        <p className="mt-1 text-[10px] text-muted">
                          Hover the preview to scroll the full page
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {profileReady ? (
                            <>
                              <Button
                                type="button"
                                disabled={Boolean(creatingId)}
                                onClick={() =>
                                  void useTemplate(template, {
                                    openEditor: false,
                                  })
                                }
                                className="rounded-lg px-3 py-1.5 text-xs"
                              >
                                {busy ? "Creating…" : "Select theme"}
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                disabled={Boolean(creatingId)}
                                onClick={() => void useTemplate(template)}
                                className="rounded-lg px-3 py-1.5 text-xs"
                              >
                                {busy ? "Creating…" : "Customize first"}
                              </Button>
                            </>
                          ) : (
                            <Link
                              href="/dashboard/business"
                              className="btn-primary rounded-lg px-3 py-1.5 text-xs"
                            >
                              Add business name to select
                            </Link>
                          )}
                          <a
                            href={`/dashboard/websites/themes/${encodeURIComponent(template.id)}/preview`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary rounded-lg px-3 py-1.5 text-xs"
                          >
                            Preview
                          </a>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {templates.length > 0 && templates.length < templatesTotal ? (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loadingMoreTemplates}
                  onClick={() => void loadMoreTemplates()}
                  className="rounded-lg px-4 py-2 text-sm"
                >
                  {loadingMoreTemplates ? "Loading…" : "Load more themes"}
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </WorkspaceRequired>
  );
}
