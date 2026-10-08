"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  SiteDocumentHead,
  seoDocumentFields,
} from "@/components/site/SiteDocumentHead";
import {
  FullscreenPreviewControls,
  previewFrameClassName,
  previewMainClassName,
  showMobilePreviewChrome,
} from "@/components/site/PreviewViewportFrame";
import { ViewportToolbar } from "@/components/site/ViewportToolbar";
import { themeColorKey } from "@/components/editor/sections/sectionStyles";
import { WebsiteRenderer } from "@/components/site/WebsiteRenderer";
import { isFullscreenViewport } from "@/components/site/viewport";
import { Alert } from "@/components/ui/Alert";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as previewApi from "@/services/preview.api";
import type { EditorViewport } from "@/types/editor";
import type { WebsitePreviewData } from "@/types/preview";

export default function WebsitePreviewPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("slug") ?? undefined;
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const [data, setData] = useState<WebsitePreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<EditorViewport>("desktop");

  const load = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const res = await previewApi.getWebsitePreview(
        currentWorkspace.id,
        websiteId,
        slugParam
      );
      setData(res.data);
    } catch (err) {
      setData(null);
      setError(
        err instanceof ApiClientError ? err.message : "Failed to load preview"
      );
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, websiteId, slugParam]);

  useEffect(() => {
    void load();
  }, [load]);

  function selectSlug(slug: string) {
    const qs = new URLSearchParams();
    qs.set("slug", slug);
    router.push(`/dashboard/websites/${websiteId}/preview?${qs.toString()}`);
  }

  const seo = data
    ? seoDocumentFields(data.page.seo, {
        title: `${data.page.name} · ${data.website.name}`,
        description: data.website.description ?? undefined,
      })
    : null;

  const immersive = isFullscreenViewport(viewport);

  const inquiryTarget =
    currentWorkspace && data
      ? {
          workspaceId: data.website.workspaceId || currentWorkspace.id,
          websitePublicId: data.website.publicId,
          websiteId: data.website.id,
          websiteName: data.website.name,
        }
      : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {seo ? (
        <SiteDocumentHead
          title={seo.title}
          description={seo.description}
          socialImage={seo.socialImage}
          slug={data?.page.slug}
        />
      ) : null}

      <FullscreenPreviewControls
        viewport={viewport}
        onViewportChange={setViewport}
      >
        <Link
          href={`/dashboard/websites/${websiteId}/editor`}
          className="rounded-full border border-card-border px-3 py-1.5 font-medium hover:bg-black/[0.04]"
        >
          Editor
        </Link>
      </FullscreenPreviewControls>

      {!immersive ? (
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-card-border bg-card px-3 py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href={`/dashboard/websites/${websiteId}`}
            className="text-xs text-muted hover:text-brand"
          >
            ← Website
          </Link>
          <span className="truncate text-sm font-semibold">
            {data?.website.name ?? "Preview"}
          </span>
          {data ? (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
              /{data.page.slug}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data?.pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectSlug(p.slug)}
              className={`rounded-lg px-2.5 py-1 text-xs ${
                data.page.slug === p.slug
                  ? "bg-brand/15 font-semibold text-brand-deep"
                  : "border border-card-border text-muted hover:border-brand/40"
              }`}
            >
              {p.name}
            </button>
          ))}
          <Link
            href={`/dashboard/websites/${websiteId}/editor`}
            className="btn-secondary rounded-lg px-2.5 py-1 text-xs"
          >
            Editor
          </Link>
        </div>
      </header>
      ) : null}

      {!immersive ? (
        <ViewportToolbar viewport={viewport} onViewportChange={setViewport} />
      ) : null}

      {!immersive && seo ? (
        <div className="shrink-0 border-b border-card-border bg-white/80 px-3 py-1.5 text-[10px] text-muted">
          SEO · title: {seo.title}
          {seo.description ? ` · ${seo.description.slice(0, 80)}` : ""}
          {data?.page.slug ? ` · slug: ${data.page.slug}` : ""}
        </div>
      ) : null}

      <main className={previewMainClassName(viewport)}>
        {loading ? (
          <p className="text-sm text-muted">Loading preview…</p>
        ) : error ? (
          <div className="max-w-md space-y-3">
            <Alert tone="error">{error}</Alert>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/websites/${websiteId}/pages/new`}
                className="btn-primary rounded-lg px-3 py-2 text-xs"
              >
                Create a page
              </Link>
              <Link
                href={`/dashboard/websites/${websiteId}/editor`}
                className="btn-secondary rounded-lg px-3 py-2 text-xs"
              >
                Open editor
              </Link>
            </div>
          </div>
        ) : data ? (
          <div
            className={
              immersive
                ? "min-h-full w-full"
                : "flex w-full flex-col items-center"
            }
          >
            <div className={previewFrameClassName(viewport)}>
              {showMobilePreviewChrome(viewport) ? (
                <div className="flex h-6 items-center justify-center border-b border-black/5 bg-black/[0.03]">
                  <span
                    className="h-1 w-12 rounded-full bg-black/15"
                    aria-hidden
                  />
                </div>
              ) : null}
              <WebsiteRenderer
                key={themeColorKey(data.website.theme ?? {})}
                theme={data.website.theme ?? {}}
                sections={data.page.sections}
                emptyMessage="This page has no sections yet. Add blocks in the editor."
                revealOnScroll
                inquiryTarget={inquiryTarget}
              />
            </div>
            {!immersive ? (
              <p className="mt-4 text-center text-[11px] text-muted">
                Draft preview — your live Safnom subdomain uses the last published version
              </p>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
