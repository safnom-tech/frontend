"use client";

import { useCallback, useEffect, useState } from "react";
import { AiPreviewModal } from "@/components/editor/ai/AiPreviewModal";
import { useEditor } from "@/contexts/EditorContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as aiApi from "@/services/ai.api";
import * as pagesApi from "@/services/pages.api";
import type { AiSectionAction } from "@/types/ai";

export function AiSeoActions() {
  const { currentWorkspace } = useWorkspace();
  const { websiteId, pageId, website } = useEditor();
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState("");
  const [pendingSeo, setPendingSeo] = useState<{
    title?: string | null;
    metaDescription?: string | null;
  } | null>(null);
  const [open, setOpen] = useState(false);

  const loadSeo = useCallback(async () => {
    if (!currentWorkspace) return;
    try {
      const res = await pagesApi.getPage(currentWorkspace.id, websiteId, pageId);
      setSeoTitle(res.data.seo?.title ?? "");
      setSeoDesc(res.data.seo?.metaDescription ?? "");
    } catch {
      /* ignore */
    }
  }, [currentWorkspace, websiteId, pageId]);

  useEffect(() => {
    void loadSeo();
  }, [loadSeo]);

  async function run(action: AiSectionAction) {
    if (!currentWorkspace) return;
    setLoading(true);
    setError(null);
    setOpen(true);
    setPreview("Generating…");
    setPendingSeo(null);
    try {
      const res = await aiApi.runSectionAiAction(currentWorkspace.id, {
        action,
        websiteId,
        pageId,
        businessContext: {
          businessName: website?.name,
          businessDescription: website?.description ?? undefined,
        },
      });
      const seo = res.data.seo ?? {};
      setPendingSeo(seo);
      setPreview(JSON.stringify(seo, null, 2));
    } catch (err) {
      setOpen(false);
      setError(err instanceof ApiClientError ? err.message : "AI request failed");
    } finally {
      setLoading(false);
    }
  }

  async function applySeo() {
    if (!currentWorkspace || !pendingSeo) return;
    await pagesApi.updatePage(currentWorkspace.id, websiteId, pageId, {
      seo: {
        title: pendingSeo.title ?? (seoTitle || null),
        metaDescription: pendingSeo.metaDescription ?? (seoDesc || null),
      },
    });
    await loadSeo();
    setOpen(false);
  }

  return (
    <section className="border-t border-card-border p-3">
      <p className="mb-1 text-xs font-medium text-muted">Page SEO</p>
      <p className="mb-2 text-[11px] text-muted">Title: {seoTitle || "—"}</p>
      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className="rounded-md border border-card-border px-2 py-1 text-[10px]"
          disabled={loading}
          onClick={() => void run("seo_title")}
        >
          Generate SEO title
        </button>
        <button
          type="button"
          className="rounded-md border border-card-border px-2 py-1 text-[10px]"
          disabled={loading}
          onClick={() => void run("seo_description")}
        >
          Generate SEO description
        </button>
      </div>
      <AiPreviewModal
        open={open}
        title="AI SEO suggestion"
        previewJson={preview}
        loading={loading}
        onClose={() => setOpen(false)}
        onApply={() => void applySeo()}
      />
    </section>
  );
}
