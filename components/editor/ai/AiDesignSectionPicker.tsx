"use client";

import { AiDesignSectionPreview } from "@/components/editor/ai/AiDesignSectionPreview";
import {
  AI_DESIGN_SECTIONS,
  type AiDesignSectionId,
} from "@/lib/aiDesignSections";

export function AiDesignSectionPicker({
  value,
  onChange,
  disabled,
}: {
  value: AiDesignSectionId;
  onChange: (id: AiDesignSectionId) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold">Section structure</p>
      <p className="mt-0.5 text-[10px] leading-snug text-muted">
        Choose a ready-made design. AI only writes the words — layout and photos
        stay fixed (one stock image) to save time and tokens.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {AI_DESIGN_SECTIONS.map((design) => {
          const selected = value === design.id;
          return (
            <button
              key={design.id}
              type="button"
              disabled={disabled}
              title={design.description}
              onClick={() => onChange(design.id)}
              className={`flex flex-col overflow-hidden rounded-xl border text-left transition ${
                selected
                  ? "border-brand ring-2 ring-brand/35"
                  : "border-card-border hover:border-brand/40"
              }`}
            >
              <div className="overflow-hidden border-b border-card-border bg-neutral-50">
                <AiDesignSectionPreview id={design.id} />
              </div>
              <div className="px-2.5 py-2">
                <span className="block text-[11px] font-semibold text-foreground">
                  {design.name}
                </span>
                <span className="mt-0.5 block text-[10px] leading-snug text-muted">
                  {design.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
