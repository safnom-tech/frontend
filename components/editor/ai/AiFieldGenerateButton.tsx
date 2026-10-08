"use client";

import { useState } from "react";
import { AiFieldContentModal } from "@/components/editor/ai/AiFieldContentModal";
import {
  fieldTypeSupportsAiGeneration,
  type FieldContentType,
} from "@/lib/fieldContentAi";
import type { BusinessContextInput } from "@/types/ai";

export function AiFieldGenerateButton({
  fieldType,
  fieldLabel,
  currentValue,
  businessContext,
  onApply,
  variant = "inline",
  className = "",
  useCurrentAsLengthFloor = true,
}: {
  fieldType: FieldContentType;
  fieldLabel?: string;
  currentValue?: string;
  businessContext?: BusinessContextInput;
  onApply: (content: string) => void;
  variant?: "inline" | "inlineToolbar" | "panel";
  className?: string;
  /** When false, limits ignore existing copy length (better for card lines). */
  useCurrentAsLengthFloor?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!fieldTypeSupportsAiGeneration(fieldType)) {
    return null;
  }

  const btnClass =
    variant === "panel"
      ? "shrink-0 rounded-lg border border-brand/30 bg-brand/5 px-2 py-1 text-[10px] font-semibold text-brand hover:bg-brand/10"
      : variant === "inlineToolbar"
        ? "max-w-[11rem] whitespace-normal rounded-lg bg-brand px-2 py-1.5 text-left text-[10px] font-semibold leading-tight text-white shadow-sm transition hover:bg-brand-deep sm:max-w-none sm:whitespace-nowrap sm:text-[11px]"
        : "whitespace-nowrap rounded-full border border-brand/40 bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-brand shadow-sm hover:bg-brand/5";

  return (
    <>
      <button
        type="button"
        className={`${btnClass} ${className}`}
        title={
          variant === "inlineToolbar"
            ? "Describe what you want — AI writes or rewrites this text for you"
            : "Generate text with AI"
        }
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
      >
        {variant === "inlineToolbar"
          ? "✨ Create content with AI"
          : "✨ Generate with AI"}
      </button>
      <AiFieldContentModal
        open={open}
        fieldType={fieldType}
        fieldLabel={fieldLabel}
        currentValue={currentValue}
        businessContext={businessContext}
        useCurrentAsLengthFloor={useCurrentAsLengthFloor}
        onClose={() => setOpen(false)}
        onApply={(content) => {
          onApply(content);
          setOpen(false);
        }}
      />
    </>
  );
}
