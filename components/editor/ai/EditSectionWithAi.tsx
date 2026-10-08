"use client";

import { useState } from "react";
import { AiComposedSectionPreviewModal } from "@/components/editor/ai/AiComposedSectionPreviewModal";
import {
  AiSectionGeneratorModal,
  type AiGeneratorFormValues,
} from "@/components/editor/ai/AiSectionGeneratorModal";
import { AiPrebuiltSectionEditModal } from "@/components/editor/ai/AiPrebuiltSectionEditModal";
import { useEditor } from "@/contexts/EditorContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as aiApi from "@/services/ai.api";
import { parseComposedSectionFromData } from "@/types/composed-section";
import type { PageSection } from "@/types/page";
import type { SectionStyleSettings } from "@/types/editor";

export type SectionAiApplyPayload = {
  data?: Record<string, unknown>;
  settings?: SectionStyleSettings;
};

export function EditSectionWithAi({
  section,
  variant = "toolbar",
  onApply,
}: {
  section: PageSection;
  variant?: "toolbar" | "panel";
  onApply: (payload: SectionAiApplyPayload) => void;
}) {
  const { currentWorkspace } = useWorkspace();
  const { websiteId, pageId, website } = useEditor();
  const isComposed = section.type === "COMPOSED";

  const [composedEditorOpen, setComposedEditorOpen] = useState(false);
  const [composedPreviewOpen, setComposedPreviewOpen] = useState(false);
  const [prebuiltOpen, setPrebuiltOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastForm, setLastForm] = useState<AiGeneratorFormValues | null>(null);
  const [pendingComposedData, setPendingComposedData] = useState<Record<string, unknown> | null>(
    null
  );
  const [pendingComposedSection, setPendingComposedSection] = useState(
    () => parseComposedSectionFromData(section.data)
  );

  const currentComposed = parseComposedSectionFromData(section.data);

  const businessContext = website
    ? {
        businessName: website.name,
        businessDescription: website.description ?? undefined,
      }
    : undefined;

  async function runComposedEdit(values: AiGeneratorFormValues, mode: "edit" | "regenerate") {
    const liveSection = parseComposedSectionFromData(section.data);
    if (!currentWorkspace || !liveSection) return;
    const baseSection =
      mode === "edit" ? liveSection : (pendingComposedSection ?? liveSection);
    setLoading(true);
    setError(null);
    setComposedPreviewOpen(true);
    setComposedEditorOpen(false);
    setLastForm(values);
    setPendingComposedData(null);

    try {
      const payload = {
        websiteId,
        pageId,
        prompt: values.prompt,
        layoutPresetId: values.layoutPresetId,
        businessContext,
        currentSection: baseSection,
      };

      const res =
        mode === "regenerate"
          ? await aiApi.regenerateComposedSection(currentWorkspace.id, payload)
          : await aiApi.editComposedSectionWithAi(currentWorkspace.id, payload);

      setPendingComposedSection(res.data.section);
      setPendingComposedData(res.data.data);
    } catch (err) {
      setComposedPreviewOpen(false);
      setError(
        err instanceof ApiClientError
          ? err.message
          : "We couldn't update the section right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function openFlow() {
    setError(null);
    if (isComposed) {
      if (!currentComposed) {
        setError("Invalid custom section data.");
        return;
      }
      setPendingComposedSection(currentComposed);
      setPendingComposedData(null);
      setComposedEditorOpen(true);
    } else {
      setPrebuiltOpen(true);
    }
  }

  const btnClass =
    variant === "toolbar"
      ? "rounded-md border border-brand/40 bg-brand/10 px-2.5 py-1 text-[10px] font-semibold text-brand hover:bg-brand/15"
      : "mt-2 w-full rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white";

  if (isComposed && !currentComposed) {
    return null;
  }

  return (
    <>
      {variant === "panel" ? (
        <div className="mt-3 rounded-lg border border-dashed border-brand/30 bg-brand/5 p-3">
          <p className="text-xs font-semibold">AI design assistant</p>
          <p className="mt-0.5 text-[10px] text-muted">
            Refine layout, copy, or styling with a short instruction.
          </p>
          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
          <button type="button" className={btnClass} onClick={openFlow}>
            ✨ Edit section with AI
          </button>
        </div>
      ) : (
        <>
          {error ? (
            <span className="text-[10px] text-red-600" title={error}>
              AI error
            </span>
          ) : null}
          <button type="button" className={btnClass} onClick={openFlow}>
            ✨ Edit section with AI
          </button>
        </>
      )}

      {isComposed ? (
        <>
          <AiSectionGeneratorModal
            open={composedEditorOpen}
            mode="edit"
            initialPrompt={lastForm?.prompt ?? ""}
            initialLayoutPresetId={currentComposed?.layout}
            loading={loading}
            onClose={() => setComposedEditorOpen(false)}
            onGenerate={(values) => void runComposedEdit(values, "edit")}
          />
          <AiComposedSectionPreviewModal
            open={composedPreviewOpen}
            loading={loading}
            section={pendingComposedSection}
            pageData={pendingComposedData}
            onClose={() => setComposedPreviewOpen(false)}
            onEditPrompt={() => {
              setComposedPreviewOpen(false);
              setComposedEditorOpen(true);
            }}
            onRegenerate={() => {
              if (lastForm) void runComposedEdit(lastForm, "regenerate");
            }}
            onApply={() => {
              if (pendingComposedData) {
                onApply({ data: pendingComposedData });
              }
              setComposedPreviewOpen(false);
            }}
          />
        </>
      ) : (
        <AiPrebuiltSectionEditModal
          open={prebuiltOpen}
          section={section}
          businessContext={businessContext}
          onClose={() => setPrebuiltOpen(false)}
          onApply={(payload) => {
            onApply(payload);
            setPrebuiltOpen(false);
          }}
        />
      )}
    </>
  );
}
