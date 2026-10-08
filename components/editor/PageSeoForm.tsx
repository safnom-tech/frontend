"use client";

import { useEditor } from "@/contexts/EditorContext";

export function PageSeoForm() {
  const { pageName, pageSlug, pageSeo, updatePageMeta, save, saveStatus } =
    useEditor();

  const titleLen = (pageSeo.title ?? "").length;
  const descLen = (pageSeo.metaDescription ?? "").length;

  return (
    <div>
      <p className="mb-3 text-[11px] leading-snug text-muted">
        Search and social preview for this page.
      </p>
      <div className="space-y-2.5">
        <label className="block text-[11px]">
          <span className="font-medium text-muted">Page name</span>
          <input
            type="text"
            value={pageName}
            onChange={(e) => updatePageMeta({ name: e.target.value })}
            className="mt-1 w-full rounded-md border border-card-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-[11px]">
          <span className="font-medium text-muted">URL slug</span>
          <input
            type="text"
            value={pageSlug}
            onChange={(e) =>
              updatePageMeta({
                slug: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]+/g, "-")
                  .replace(/^-|-$/g, ""),
              })
            }
            className="mt-1 w-full rounded-md border border-card-border px-2.5 py-1.5 font-mono text-sm"
          />
        </label>
        <label className="block text-[11px]">
          <span className="font-medium text-muted">
            SEO title{" "}
            <span className={titleLen > 60 ? "text-amber-600" : "text-muted"}>
              ({titleLen}/60)
            </span>
          </span>
          <input
            type="text"
            value={pageSeo.title ?? ""}
            placeholder={pageName || "Page title for Google"}
            onChange={(e) =>
              updatePageMeta({ seo: { title: e.target.value || null } })
            }
            className="mt-1 w-full rounded-md border border-card-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-[11px]">
          <span className="font-medium text-muted">
            Meta description{" "}
            <span className={descLen > 160 ? "text-amber-600" : "text-muted"}>
              ({descLen}/160)
            </span>
          </span>
          <textarea
            rows={3}
            value={pageSeo.metaDescription ?? ""}
            placeholder="Short summary for search results"
            onChange={(e) =>
              updatePageMeta({
                seo: { metaDescription: e.target.value || null },
              })
            }
            className="mt-1 w-full resize-y rounded-md border border-card-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-[11px]">
          <span className="font-medium text-muted">Social share image URL</span>
          <input
            type="url"
            value={pageSeo.socialImage ?? ""}
            placeholder="https://… (optional)"
            onChange={(e) =>
              updatePageMeta({ seo: { socialImage: e.target.value || null } })
            }
            className="mt-1 w-full rounded-md border border-card-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <button
          type="button"
          disabled={saveStatus === "saving"}
          onClick={() => void save()}
          className="w-full rounded-md bg-brand py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saveStatus === "saving" ? "Saving…" : "Save page & SEO"}
        </button>
      </div>
    </div>
  );
}
