"use client";

import { useMemo } from "react";
import { ComposedSectionView } from "@/components/editor/sections/ComposedSectionView";
import { themeCssVars } from "@/components/editor/sections/sectionStyles";
import { Button } from "@/components/ui/Button";
import { useEditor } from "@/contexts/EditorContext";
import type { ComposedSectionDefinition } from "@/types/composed-section";
import type { PageSection } from "@/types/page";

export function AiComposedSectionPreviewModal({
  open,
  loading,
  section,
  pageData,
  onClose,
  onApply,
  onRegenerate,
  onEditPrompt,
  onCustomize,
}: {
  open: boolean;
  loading?: boolean;
  section: ComposedSectionDefinition | null;
  pageData?: Record<string, unknown> | null;
  onClose: () => void;
  onApply: () => void;
  onRegenerate: () => void;
  onEditPrompt: () => void;
  onCustomize?: () => void;
}) {
  const { theme } = useEditor();
  const previewSection: PageSection | null = useMemo(() => {
    if (!section || !pageData) return null;
    return {
      id: "preview",
      type: "COMPOSED",
      order: 0,
      data: pageData,
      settings: { aiGenerated: true },
    };
  }, [section, pageData]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-card-border bg-card shadow-2xl sm:rounded-2xl">
        <div className="border-b border-card-border px-5 py-4">
          <h3 className="text-base font-semibold">AI generated preview</h3>
          <p className="mt-1 text-xs text-muted">
            Review the layout on your brand colors before adding it to the page.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto bg-[var(--site-muted-bg)] p-3 sm:p-4">
          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-brand/30 bg-white/70 p-8 text-center">
              <p className="text-sm font-semibold text-brand">✨ Creating your section…</p>
              <p className="mt-2 max-w-sm text-xs text-muted">
                AI is composing layout, content, and responsive settings. This usually takes a few seconds.
              </p>
            </div>
          ) : previewSection ? (
            <div
              className="overflow-hidden rounded-xl border border-card-border bg-white shadow-sm"
              style={themeCssVars(theme)}
            >
              <ComposedSectionView section={previewSection} style={{}} themeVars={{}} />
            </div>
          ) : (
            <p className="text-sm text-muted">No preview available.</p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-card-border px-5 py-4">
          <Button type="button" variant="secondary" className="rounded-lg text-xs" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-lg text-xs"
            disabled={loading}
            onClick={onEditPrompt}
          >
            Edit prompt
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-lg text-xs"
            disabled={loading || !section}
            onClick={onRegenerate}
          >
            Regenerate with AI
          </Button>
          {onCustomize ? (
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg text-xs"
              disabled={loading}
              onClick={onCustomize}
            >
              Customize
            </Button>
          ) : null}
          <Button
            type="button"
            className="rounded-lg text-xs"
            disabled={loading || !section}
            onClick={onApply}
          >
            Apply section
          </Button>
        </div>
      </div>
    </div>
  );
}
