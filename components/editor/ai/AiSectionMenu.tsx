"use client";

import { useState } from "react";
import { AiPreviewModal } from "@/components/editor/ai/AiPreviewModal";
import { useEditor } from "@/contexts/EditorContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as aiApi from "@/services/ai.api";
import type { AiSectionAction } from "@/types/ai";
import type { PageSection } from "@/types/page";

const commonActions: { action: AiSectionAction; label: string }[] = [
  { action: "generate", label: "Generate content" },
  { action: "rewrite", label: "Rewrite" },
  { action: "shorten", label: "Make shorter" },
  { action: "professional", label: "Make professional" },
];

export function AiSectionMenu({ section }: { section: PageSection }) {
  const { currentWorkspace } = useWorkspace();
  const { websiteId, pageId, updateSectionData } = useEditor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);
  const [open, setOpen] = useState(false);

  async function run(action: AiSectionAction) {
    if (!currentWorkspace) return;
    setLoading(true);
    setError(null);
    setOpen(true);
    setPreview("Generating…");
    setPending(null);
    try {
      const res = await aiApi.runSectionAiAction(currentWorkspace.id, {
        action,
        websiteId,
        pageId,
        sectionId: section.id,
        sectionType: section.type,
        content: section.data,
      });
      if (res.data.data) {
        setPending(res.data.data);
        setPreview(JSON.stringify(res.data.data, null, 2));
      } else {
        setPreview("No content returned.");
      }
    } catch (err) {
      setPreview("");
      setError(err instanceof ApiClientError ? err.message : "AI request failed");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  const extra: { action: AiSectionAction; label: string }[] = [];
  if (section.type === "TEXT") {
    extra.push({ action: "generate_about", label: "Generate About Us" });
  }
  if (section.type === "SERVICES" || section.type === "FEATURES") {
    extra.push({ action: "generate_services", label: "Generate services" });
  }
  if (section.type === "FAQ") {
    extra.push({ action: "generate_faqs", label: "Generate FAQs" });
  }

  return (
    <div className="rounded-lg border border-dashed border-brand/30 bg-brand/5 p-2">
      <p className="mb-2 text-xs font-semibold">AI assistant</p>
      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-1">
        {[...commonActions, ...extra].map(({ action, label }) => (
          <button
            key={action}
            type="button"
            disabled={loading}
            className="rounded-md border border-card-border bg-white px-2 py-1 text-[10px] hover:border-brand/40"
            onClick={() => void run(action)}
          >
            {label}
          </button>
        ))}
      </div>
      <AiPreviewModal
        open={open}
        title="AI suggestion"
        previewJson={preview}
        loading={loading}
        onClose={() => setOpen(false)}
        onApply={() => {
          if (pending) {
            updateSectionData(section.id, pending);
          }
          setOpen(false);
        }}
      />
    </div>
  );
}
