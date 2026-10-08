"use client";

import { AI_TONE_PRESETS } from "@/lib/aiTonePresets";

export function AiToneChips({
  selectedId,
  onSelect,
  disabled,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {AI_TONE_PRESETS.map((tone) => {
        const active = selectedId === tone.id;
        return (
          <button
            key={tone.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(active ? null : tone.id)}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition disabled:opacity-50 ${
              active
                ? "border-brand bg-brand/15 text-brand"
                : "border-card-border bg-white text-muted hover:border-brand/40 hover:text-foreground"
            }`}
          >
            {tone.label}
          </button>
        );
      })}
    </div>
  );
}
