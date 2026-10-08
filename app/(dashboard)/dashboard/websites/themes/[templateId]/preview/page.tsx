"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FullscreenPreviewControls,
  previewFrameClassName,
  previewMainClassName,
  showMobilePreviewChrome,
} from "@/components/site/PreviewViewportFrame";
import { ViewportToolbar } from "@/components/site/ViewportToolbar";
import { WebsiteRenderer } from "@/components/site/WebsiteRenderer";
import { isFullscreenViewport } from "@/components/site/viewport";
import { themeColorKey } from "@/components/editor/sections/sectionStyles";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { createWebsiteFromTemplateAndOpenEditor } from "@/lib/createWebsiteFromTemplate";
import { hasBusinessName } from "@/types/business-profile";
import * as previewApi from "@/services/preview.api";
import type { EditorViewport } from "@/types/editor";
import type { TemplateThemePreviewData } from "@/types/preview";

export default function ThemePreviewPage() {
  const params = useParams();
  const templateId = params.templateId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [preview, setPreview] = useState<TemplateThemePreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewport, setViewport] = useState<EditorViewport>("desktop");
  const profileReady = hasBusinessName(currentWorkspace?.businessProfile);

  const profileKey = useMemo(
    () => JSON.stringify(currentWorkspace?.businessProfile ?? {}),
    [currentWorkspace?.businessProfile]
  );

  useEffect(() => {
    if (authLoading || !user || !currentWorkspace) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void previewApi
      .getTemplateThemePreview(currentWorkspace.id, templateId)
      .then((res) => {
        if (!cancelled) setPreview(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setPreview(null);
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Failed to load theme preview"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [templateId, authLoading, user, currentWorkspace?.id, profileKey]);

  const theme = preview?.theme ?? {};
  const sections = preview?.page.sections ?? [];
  const immersive = isFullscreenViewport(viewport);

  const inquiryTarget = currentWorkspace
    ? { workspaceId: currentWorkspace.id }
    : null;

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#eef1f4]">
      <FullscreenPreviewControls
        viewport={viewport}
        onViewportChange={setViewport}
      >
        <Link
          href="/dashboard/websites#themes"
          className="rounded-full border border-card-border px-3 py-1.5 font-medium hover:bg-black/[0.04]"
        >
          Close
        </Link>
      </FullscreenPreviewControls>

      {!immersive ? (
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-card-border bg-card px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {preview?.template.name ?? "Theme preview"}
            </p>
            <p className="text-[11px] text-muted">
              {preview?.businessProfileApplied
                ? `Preview with ${preview.businessProfile.businessName}`
                : "Full design preview — add Business profile for your branding"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!preview?.businessProfileApplied ? (
              <Link
                href="/dashboard/business"
                className="btn-secondary rounded-lg px-3 py-1.5 text-xs"
              >
                Business profile
              </Link>
            ) : null}
            <Link
              href="/dashboard/websites#themes"
              className="btn-secondary rounded-lg px-3 py-1.5 text-xs"
            >
              Close
            </Link>
            {profileReady ? (
              <Button
                type="button"
                disabled={creating}
                className="rounded-lg px-3 py-1.5 text-xs"
                onClick={() => {
                  if (!currentWorkspace) return;
                  setCreating(true);
                  setError(null);
                  void createWebsiteFromTemplateAndOpenEditor(
                    currentWorkspace.id,
                    templateId,
                    router
                  ).catch((err) => {
                    setError(
                      err instanceof ApiClientError
                        ? err.message
                        : "Could not create website from this theme"
                    );
                    setCreating(false);
                  });
                }}
              >
                {creating ? "Creating…" : "Use this design"}
              </Button>
            ) : (
              <Link
                href="/dashboard/business"
                className="btn-primary rounded-lg px-3 py-1.5 text-xs"
              >
                Add business profile
              </Link>
            )}
          </div>
        </header>
      ) : null}

      {!immersive ? (
        <ViewportToolbar viewport={viewport} onViewportChange={setViewport} />
      ) : null}

      <main className={previewMainClassName(viewport)}>
        {authLoading || loading ? (
          <p className="text-sm text-muted">Loading preview…</p>
        ) : error ? (
          <div className="max-w-md">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : preview ? (
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
                key={themeColorKey(theme)}
                theme={theme}
                sections={sections}
                emptyMessage="This theme has no preview content."
                revealOnScroll
                inquiryTarget={inquiryTarget}
              />
            </div>
            {!immersive ? (
              <p className="mt-4 text-center text-[11px] text-muted">
                {preview.businessProfileApplied
                  ? "Preview shows your saved business details on this theme"
                  : "Theme preview — save Business profile to see your name and logo here"}
              </p>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
