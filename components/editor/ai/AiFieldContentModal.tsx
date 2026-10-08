"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ModalPortal } from "@/components/ui/ModalPortal";
import {
  FIELD_CONTENT_LIMITS,
  clampFieldMaxWords,
  defaultMaxWordsFromCurrentText,
  fieldContentTypeLabel,
  formatCharacterLimitLabel,
  formatWordLimitLabel,
  resolveLengthBoundsFromCurrentValue,
  type FieldContentType,
} from "@/lib/fieldContentAi";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as aiApi from "@/services/ai.api";
import { AiToneChips } from "@/components/editor/ai/AiToneChips";
import { splitPreviewParagraphs } from "@/lib/formatAiPreviewParagraphs";
import { buildAiPromptWithTone } from "@/lib/aiTonePresets";
import { plainTextFromInlineField } from "@/lib/inlineRichText";
import type { BusinessContextInput } from "@/types/ai";

export function AiFieldContentModal({
  open,
  fieldType,
  fieldLabel,
  currentValue,
  businessContext,
  useCurrentAsLengthFloor = true,
  onClose,
  onApply,
}: {
  open: boolean;
  fieldType: FieldContentType;
  fieldLabel?: string;
  currentValue?: string;
  businessContext?: BusinessContextInput;
  useCurrentAsLengthFloor?: boolean;
  onClose: () => void;
  onApply: (content: string) => void;
}) {
  const { currentWorkspace } = useWorkspace();
  const plainCurrentValue =
    plainTextFromInlineField(currentValue ?? "") || (currentValue ?? "").trim();
  const lengthReference = useCurrentAsLengthFloor
    ? plainCurrentValue
    : undefined;
  const limits = FIELD_CONTENT_LIMITS[fieldType];
  const wordCap = limits.hardMaxWords ?? limits.defaultMaxWords ?? 500;
  const [prompt, setPrompt] = useState("");
  const defaultWords = limits.defaultMaxWords ?? 50;
  const [maxWordsInput, setMaxWordsInput] = useState(String(defaultWords));
  const parsedMaxWords = Number.parseInt(maxWordsInput, 10);
  const effectiveMaxWords = limits.allowsWordLimit
    ? clampFieldMaxWords(
        fieldType,
        Number.isFinite(parsedMaxWords) ? parsedMaxWords : defaultWords
      )
    : undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [toneId, setToneId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPrompt("");
      setToneId(null);
      setPreview(null);
      setError(null);
      const fallback = limits.defaultMaxWords ?? 50;
      setMaxWordsInput(
        String(
          defaultMaxWordsFromCurrentText(fieldType, lengthReference, fallback)
        )
      );
    }
  }, [open, limits.defaultMaxWords, fieldType, lengthReference]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function resolveAiPrompt(): string {
    let aiPrompt = buildAiPromptWithTone(prompt, toneId);
    if (!aiPrompt.trim() && plainCurrentValue) {
      aiPrompt =
        "Rewrite and improve the current text for this website. Keep it clear and on-topic.";
    }
    return aiPrompt.trim();
  }

  async function runGenerate(regenerate: boolean) {
    const aiPrompt = resolveAiPrompt();
    if (!currentWorkspace) {
      setError("No workspace selected. Open the site from your dashboard and try again.");
      return;
    }
    if (!aiPrompt) {
      setError("Describe what you want, or pick a quick tone chip.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const contextValue = regenerate
        ? preview ?? plainCurrentValue
        : plainCurrentValue;
      const userDirected = Boolean(prompt.trim() || toneId);
      const sendCurrent = regenerate
        ? contextValue || undefined
        : useCurrentAsLengthFloor
          ? contextValue || undefined
          : userDirected
            ? undefined
            : contextValue || undefined;
      const res = await aiApi.generateFieldContent(currentWorkspace.id, {
        prompt: aiPrompt,
        fieldType,
        maxChars: limits.maxChars,
        maxWords: effectiveMaxWords,
        currentValue: sendCurrent,
        regenerate,
        businessContext,
      });
      setPreview(res.data.content);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "We couldn't generate content right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const title = fieldLabel ?? fieldContentTypeLabel(fieldType);
  const lengthSource = (preview ?? lengthReference ?? "").trim();
  const lengthBounds = resolveLengthBoundsFromCurrentValue(
    fieldType,
    lengthSource || undefined,
    {
      maxChars: limits.maxChars,
      maxWords: effectiveMaxWords,
    }
  );
  const canGenerate =
    resolveAiPrompt().length > 0 ||
    Boolean(plainCurrentValue) ||
    Boolean(buildAiPromptWithTone(prompt, toneId).trim());
  const charLimitLabel = formatCharacterLimitLabel(lengthBounds);
  const wordLimitLabel = formatWordLimitLabel({
    minWords: lengthBounds.minWords,
    maxWords: lengthBounds.maxWords,
    wordCap,
  });

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[260] flex items-end justify-center p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-field-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          aria-label="Close"
          onClick={onClose}
        />
        <div
          className="relative z-10 flex max-h-[min(90vh,640px)] w-full min-w-0 max-w-md flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-xl sm:max-w-lg"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-card-border px-5 py-4">
            <h3 id="ai-field-modal-title" className="text-base font-semibold text-foreground">
              Generate with AI
            </h3>
            <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {charLimitLabel}
              {limits.allowsWordLimit ? ` · ${wordLimitLabel}` : ""}
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <label className="block text-xs font-semibold text-foreground">
              What content do you want?
              <textarea
                className="input-field mt-2 min-h-[112px] w-full min-w-0 rounded-xl text-sm leading-normal"
                placeholder={`Describe the ${title.toLowerCase()} (${charLimitLabel}${
                  limits.allowsWordLimit ? `, ${wordLimitLabel}` : ""
                })…`}
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">Content type</p>
                <p className="mt-1 truncate rounded-lg border border-card-border bg-black/[0.02] px-3 py-2 text-xs">
                  {fieldContentTypeLabel(fieldType)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">Character limit</p>
                <p className="mt-1 break-words rounded-lg border border-card-border bg-black/[0.02] px-3 py-2 text-xs">
                  {charLimitLabel}
                </p>
              </div>
              {limits.allowsWordLimit ? (
                <label className="min-w-0 text-xs font-semibold text-foreground sm:col-span-2">
                  Max words
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="input-field mt-1 w-full min-w-0 rounded-lg text-xs"
                    placeholder={wordLimitLabel}
                    value={maxWordsInput}
                    onChange={(e) => setMaxWordsInput(e.target.value.replace(/[^\d]/g, ""))}
                    onBlur={() => {
                      const n = Number.parseInt(maxWordsInput, 10);
                      if (!Number.isFinite(n) || maxWordsInput.trim() === "") {
                        setMaxWordsInput(String(defaultWords));
                        return;
                      }
                      setMaxWordsInput(String(clampFieldMaxWords(fieldType, n)));
                    }}
                    disabled={loading}
                  />
                  <p className="mt-1 text-[10px] leading-snug text-muted">
                    {wordLimitLabel}
                    {maxWordsInput.trim()
                      ? ` · sent to AI as ${lengthBounds.maxWords ?? effectiveMaxWords}`
                      : ""}
                  </p>
                </label>
              ) : null}
            </div>

            {preview ? (
              <div className="rounded-xl border border-card-border bg-black/[0.02] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Preview
                </p>
                <div className="mt-2 space-y-3 text-sm leading-relaxed">
                  {splitPreviewParagraphs(preview).map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : null}

            {!error && !preview && plainCurrentValue && !prompt.trim() ? (
              <p className="text-xs leading-relaxed text-muted">
                You can click Generate to rewrite the existing text, or describe
                what you want above.
              </p>
            ) : null}

            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-card-border px-5 py-4">
            <Button type="button" variant="secondary" className="rounded-lg text-xs" onClick={onClose}>
              Cancel
            </Button>
            {preview ? (
              <Button
                type="button"
                variant="secondary"
                className="rounded-lg text-xs"
                disabled={loading || !canGenerate}
                onClick={() => void runGenerate(true)}
              >
                Regenerate
              </Button>
            ) : null}
            <Button
              type="button"
              className="rounded-lg text-xs"
              disabled={loading || !canGenerate}
              onClick={() => {
                if (preview) {
                  onApply(preview);
                  onClose();
                  return;
                }
                void runGenerate(false);
              }}
            >
              {loading ? "Generating…" : preview ? "Insert content" : "Generate"}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
