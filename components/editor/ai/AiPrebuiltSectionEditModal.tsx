"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { SECTION_DISPLAY } from "@/components/editor/editorUiConstants";
import type { SectionAiApplyPayload } from "@/components/editor/ai/EditSectionWithAi";
import { useEditor } from "@/contexts/EditorContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { AiToneChips } from "@/components/editor/ai/AiToneChips";
import { buildAiPromptWithTone } from "@/lib/aiTonePresets";
import { ApiClientError } from "@/lib/api-client";
import * as aiApi from "@/services/ai.api";
import type { BusinessContextInput } from "@/types/ai";
import type { PageSection } from "@/types/page";
import type { SectionStyleSettings } from "@/types/editor";

function previewLines(data: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const keys = [
    "title",
    "heading",
    "description",
    "body",
    "quote",
    "subheading",
    "buttonText",
  ];
  for (const key of keys) {
    const v = data[key];
    if (typeof v === "string" && v.trim()) {
      lines.push(v.trim());
    }
  }
  if (Array.isArray(data.items) && data.items.length > 0) {
    lines.push(`${data.items.length} list item(s) updated`);
  }
  return lines.length ? lines : ["Section content updated."];
}

export function AiPrebuiltSectionEditModal({
  open,
  section,
  businessContext,
  onClose,
  onApply,
}: {
  open: boolean;
  section: PageSection;
  businessContext?: BusinessContextInput;
  onClose: () => void;
  onApply: (payload: SectionAiApplyPayload) => void;
}) {
  const { currentWorkspace } = useWorkspace();
  const { websiteId, pageId } = useEditor();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<Record<string, unknown> | null>(null);
  const [pendingSettings, setPendingSettings] = useState<SectionStyleSettings | null>(null);
  const [toneId, setToneId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPrompt("");
      setToneId(null);
      setError(null);
      setPendingData(null);
      setPendingSettings(null);
    }
  }, [open, section.id]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function runGenerate(regenerate: boolean) {
    const aiPrompt = buildAiPromptWithTone(prompt, toneId);
    if (!currentWorkspace || !aiPrompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.runSectionAiAction(currentWorkspace.id, {
        action: "edit_from_prompt",
        websiteId,
        pageId,
        sectionId: section.id,
        sectionType: section.type,
        content: regenerate && pendingData ? pendingData : section.data,
        settings:
          regenerate && pendingSettings
            ? (pendingSettings as Record<string, unknown>)
            : (section.settings ?? {}),
        prompt: aiPrompt,
        businessContext,
      });
      if (res.data.data) {
        setPendingData(res.data.data);
        setPendingSettings((res.data.settings ?? {}) as SectionStyleSettings);
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "We couldn't update the section right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const label = SECTION_DISPLAY[section.type]?.label ?? section.type;
  const preview = pendingData ? previewLines(pendingData) : null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
      >
        <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
        <div className="relative z-10 flex max-h-[min(90vh,640px)] w-full min-w-0 max-w-md flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-xl sm:max-w-lg">
          <div className="border-b border-card-border px-5 py-4">
            <h3 className="text-base font-semibold">Edit section with AI</h3>
            <p className="mt-1 text-xs text-muted">
              {label} · update copy, layout, or styling from your instruction
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <label className="block text-xs font-semibold">
              What should change?
              <textarea
                className="input-field mt-2 min-h-[112px] w-full min-w-0 rounded-xl text-sm"
                placeholder="e.g. Make the hero two columns with image on the right, more premium tone…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
            </label>

            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                Quick tone (optional)
              </p>
              <AiToneChips
                selectedId={toneId}
                onSelect={setToneId}
                disabled={loading}
              />
            </div>

            {preview ? (
              <div className="rounded-xl border border-card-border bg-black/[0.02] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Preview</p>
                <div className="mt-2 space-y-2 text-sm leading-relaxed">
                  {preview.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                {pendingSettings && Object.keys(pendingSettings).length > 0 ? (
                  <p className="mt-2 text-[10px] text-muted">
                    Layout/settings: {JSON.stringify(pendingSettings)}
                  </p>
                ) : null}
              </div>
            ) : null}

            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-card-border px-5 py-4">
            <Button type="button" variant="secondary" className="rounded-lg text-xs" onClick={onClose}>
              Cancel
            </Button>
            {pendingData ? (
              <Button
                type="button"
                variant="secondary"
                className="rounded-lg text-xs"
                disabled={
                  loading ||
                  !buildAiPromptWithTone(prompt, toneId).trim()
                }
                onClick={() => void runGenerate(true)}
              >
                Regenerate
              </Button>
            ) : null}
            <Button
              type="button"
              className="rounded-lg text-xs"
              disabled={
                loading || !buildAiPromptWithTone(prompt, toneId).trim()
              }
              onClick={() => {
                if (pendingData) {
                  onApply({
                    data: pendingData,
                    settings: pendingSettings ?? undefined,
                  });
                  return;
                }
                void runGenerate(false);
              }}
            >
              {loading ? "Working…" : pendingData ? "Apply to section" : "Generate preview"}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
