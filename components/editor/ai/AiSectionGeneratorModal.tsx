"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { AiDesignSectionPicker } from "@/components/editor/ai/AiDesignSectionPicker";
import { PROMPT_EXAMPLES } from "@/components/editor/ai/aiSectionGeneratorConstants";
import {
  DEFAULT_AI_DESIGN_SECTION_ID,
  isAiDesignSectionId,
  type AiDesignSectionId,
} from "@/lib/aiDesignSections";
import { AiToneChips } from "@/components/editor/ai/AiToneChips";
import { buildAiPromptWithTone } from "@/lib/aiTonePresets";

export type AiGeneratorFormValues = {
  prompt: string;
  layoutPresetId: AiDesignSectionId;
};

function resolveInitialDesign(layout?: string): AiDesignSectionId {
  if (layout && isAiDesignSectionId(layout)) {
    return layout;
  }
  return DEFAULT_AI_DESIGN_SECTION_ID;
}

export function AiSectionGeneratorModal({
  open,
  initialPrompt,
  loading,
  mode = "create",
  initialLayoutPresetId,
  onClose,
  onGenerate,
}: {
  open: boolean;
  initialPrompt?: string;
  initialLayoutPresetId?: string;
  loading?: boolean;
  mode?: "create" | "edit";
  onClose: () => void;
  onGenerate: (values: AiGeneratorFormValues) => void;
}) {
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [designSectionId, setDesignSectionId] = useState<AiDesignSectionId>(
    DEFAULT_AI_DESIGN_SECTION_ID
  );
  const [toneId, setToneId] = useState<string | null>(null);

  const isEdit = mode === "edit";
  const canSubmit = Boolean(buildAiPromptWithTone(prompt, toneId).trim());

  useEffect(() => {
    if (open) {
      setPrompt(initialPrompt ?? "");
      setToneId(null);
      setDesignSectionId(resolveInitialDesign(initialLayoutPresetId));
    }
  }, [open, initialPrompt, initialLayoutPresetId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          className="absolute inset-0 bg-black/55"
          aria-label="Close"
          onClick={onClose}
        />
        <div className="relative z-10 flex max-h-[92vh] w-full min-w-0 max-w-2xl flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-2xl">
          <div className="border-b border-card-border px-5 py-4">
            <h3 className="text-base font-semibold">
              {isEdit ? "Edit section with AI" : "Design a custom section"}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {isEdit
                ? "Describe what to change. We keep your current layout and update only what you ask for."
                : "Pick a design below, then describe your message. AI only writes text for that layout — one stock photo for all images."}
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <label className="block text-xs font-semibold">
              {isEdit ? "What should change?" : "Your prompt"}
              <textarea
                className="input-field mt-2 min-h-[160px] w-full min-w-0 rounded-xl text-sm leading-relaxed"
                placeholder={
                  isEdit
                    ? "e.g. Remove the top eyebrow, section title and short description. Keep stats and buttons."
                    : "e.g. Logistics company — explain our process in 4 steps, or showcase industries we serve with short labels."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
            </label>

            {!isEdit ? (
              <AiDesignSectionPicker
                value={designSectionId}
                disabled={loading}
                onChange={setDesignSectionId}
              />
            ) : null}

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

            {!isEdit ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Examples
                </p>
                <ul className="mt-2 space-y-2">
                  {PROMPT_EXAMPLES.map((example) => (
                    <li key={example.slice(0, 32)}>
                      <button
                        type="button"
                        className="w-full rounded-lg border border-card-border px-3 py-2 text-left text-[11px] leading-snug text-[var(--editor-text,#1a3a4a)] hover:border-brand/40 hover:bg-brand/5"
                        onClick={() => setPrompt(example)}
                        disabled={loading}
                      >
                        {example}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-card-border px-5 py-4">
            <Button type="button" variant="secondary" className="rounded-lg text-xs" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg text-xs"
              disabled={loading || !canSubmit}
              onClick={() =>
              onGenerate({
                prompt: buildAiPromptWithTone(prompt, toneId),
                layoutPresetId: designSectionId,
              })
              }
            >
              {loading
                ? "Working…"
                : isEdit
                  ? "Apply changes"
                  : "Generate section"}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
