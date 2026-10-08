"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SaveStatus } from "@/components/editor/SaveStatus";
import { Button } from "@/components/ui/Button";
import { useEditor } from "@/contexts/EditorContext";

export function EditorToolbar() {
  const {
    websiteId,
    pageName,
    pageSlug,
    previewMode,
    setPreviewMode,
    save,
    saveStatus,
    dirty,
    canUndo,
    canRedo,
    undo,
    redo,
    selectSection,
    stopEditingSection,
  } = useEditor();

  useEffect(() => {
    if (previewMode) return;
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewMode, undo, redo]);

  function togglePreview() {
    if (!previewMode) {
      stopEditingSection();
      selectSection(null);
    }
    setPreviewMode(!previewMode);
  }

  const sitePreviewHref = `/dashboard/websites/${websiteId}/preview${
    pageSlug ? `?slug=${encodeURIComponent(pageSlug)}` : ""
  }`;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-card-border bg-card px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={`/dashboard/websites/${websiteId}/editor`}
          className="text-xs text-muted hover:text-brand"
        >
          ← All pages
        </Link>
        <span className="truncate text-sm font-semibold">{pageName}</span>
        {previewMode ? (
          <span className="hidden rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted sm:inline">
            Preview
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href={sitePreviewHref}
          className="btn-secondary rounded-lg px-2.5 py-1.5 text-xs"
        >
          Site preview
        </Link>
        <button
          type="button"
          onClick={togglePreview}
          className={
            previewMode
              ? "btn-primary rounded-lg px-2.5 py-1.5 text-xs"
              : "btn-secondary rounded-lg px-2.5 py-1.5 text-xs"
          }
        >
          {previewMode ? "Back to editing" : "Preview page"}
        </button>
        {!previewMode ? (
          <>
            <button
              type="button"
              className="rounded-lg border border-card-border px-2 py-1 text-[10px] font-semibold text-muted hover:bg-black/[0.03] disabled:opacity-40"
              disabled={!canUndo}
              title="Undo (⌘Z)"
              onClick={undo}
            >
              Undo
            </button>
            <button
              type="button"
              className="rounded-lg border border-card-border px-2 py-1 text-[10px] font-semibold text-muted hover:bg-black/[0.03] disabled:opacity-40"
              disabled={!canRedo}
              title="Redo (⌘⇧Z)"
              onClick={redo}
            >
              Redo
            </button>
            <SaveStatus />
            {saveStatus === "error" || dirty ? (
              <Button
                type="button"
                className="rounded-lg px-3 py-1.5 text-xs"
                disabled={saveStatus === "saving"}
                onClick={() => void save()}
              >
                {saveStatus === "error" ? "Retry save" : "Save now"}
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </header>
  );
}
