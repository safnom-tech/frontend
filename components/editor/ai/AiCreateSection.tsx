"use client";

import { useState } from "react";
import { AiComposedSectionPreviewModal } from "@/components/editor/ai/AiComposedSectionPreviewModal";
import {
  AiSectionGeneratorModal,
  type AiGeneratorFormValues,
} from "@/components/editor/ai/AiSectionGeneratorModal";
import { useEditor } from "@/contexts/EditorContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as aiApi from "@/services/ai.api";
import type { ComposedSectionDefinition } from "@/types/composed-section";

function businessContextFromWebsite(website: ReturnType<typeof useEditor>["website"]) {
  if (!website) return undefined;
  return {
    businessName: website.name,
    businessDescription: website.description ?? undefined,
  };
}

export function AiCreateSection() {
  const { currentWorkspace } = useWorkspace();
  const { websiteId, pageId, website, addSectionWithContent } = useEditor();

  const [summaryPrompt, setSummaryPrompt] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastForm, setLastForm] = useState<AiGeneratorFormValues | null>(null);
  const [composed, setComposed] = useState<ComposedSectionDefinition | null>(null);
  const [pageData, setPageData] = useState<Record<string, unknown> | null>(null);
  const [settings, setSettings] = useState<Record<string, unknown>>({});

  async function runGenerate(
    values: AiGeneratorFormValues,
    mode: "generate" | "regenerate",
    existingSection?: ComposedSectionDefinition | null
  ) {
    if (!currentWorkspace) return;
    const previousSection = existingSection ?? composed;
    setLoading(true);
    setError(null);
    setPreviewOpen(true);
    setEditorOpen(false);
    setLastForm(values);
    setSummaryPrompt(values.prompt);
    setComposed(null);
    setPageData(null);

    try {
      const payload = {
        websiteId,
        pageId,
        prompt: values.prompt,
        layoutPresetId: values.layoutPresetId,
        businessContext: businessContextFromWebsite(website),
      };

      const res =
        mode === "regenerate" && previousSection
          ? await aiApi.regenerateComposedSection(currentWorkspace.id, {
              ...payload,
              currentSection: previousSection,
            })
          : await aiApi.generateComposedSection(currentWorkspace.id, payload);

      setComposed(res.data.section);
      setPageData(res.data.data);
      setSettings(res.data.settings ?? {});
    } catch (err) {
      setPreviewOpen(false);
      setError(
        err instanceof ApiClientError
          ? err.message
          : "We couldn't generate the section right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold">AI Section Generator</p>
        <p className="mt-0.5 text-[10px] text-muted">
          Pick a layout sample — AI writes copy from your prompt. One stock photo for all images.
        </p>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          What would you like to create?
        </p>
        <p className="mt-1 min-h-[2.5rem] rounded-lg border border-card-border bg-white/70 px-3 py-2 text-xs text-[var(--editor-text,#1a3a4a)]">
          {summaryPrompt.trim() ||
            "Open the designer — choose Image + accordion or Industry carousel, then describe your content."}
        </p>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <button
        type="button"
        className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
        onClick={() => setEditorOpen(true)}
      >
        ✨ Create with AI
      </button>

      <AiSectionGeneratorModal
        key={editorOpen ? "open" : "closed"}
        open={editorOpen}
        initialPrompt={summaryPrompt}
        loading={loading}
        onClose={() => setEditorOpen(false)}
        onGenerate={(values) => void runGenerate(values, "generate")}
      />

      <AiComposedSectionPreviewModal
        open={previewOpen}
        loading={loading}
        section={composed}
        pageData={pageData}
        onClose={() => setPreviewOpen(false)}
        onEditPrompt={() => {
          setPreviewOpen(false);
          setEditorOpen(true);
        }}
        onRegenerate={() => {
          if (lastForm && composed) {
            void runGenerate(lastForm, "regenerate", composed);
          }
        }}
        onApply={() => {
          if (pageData) {
            void addSectionWithContent("COMPOSED", pageData, settings);
          }
          setPreviewOpen(false);
        }}
      />
    </div>
  );
}
