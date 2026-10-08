"use client";

import {
  COMPOSED_LAYOUT_PRESETS,
  type ComposedLayoutPresetId,
} from "@/lib/composedLayoutPresets";

function WireframeThumb({ id }: { id: ComposedLayoutPresetId }) {
  const box = "rounded-sm bg-neutral-400/70";
  const line = "rounded-sm bg-neutral-300/90";
  switch (id) {
    case "image-accordion":
      return (
        <div className="grid h-full grid-cols-2 gap-1 p-1.5">
          <div className={`${box} min-h-[2rem] rounded-md`} />
          <div className="flex flex-col gap-0.5">
            <div className={`${line} h-1 w-3/4`} />
            <div className={`${line} h-1 w-2/3 opacity-60`} />
            <div className={`${line} mt-1 h-1 w-full`} />
            {[1, 2, 3].map((n) => (
              <div key={n} className={`${line} h-1 w-full opacity-80`} />
            ))}
          </div>
        </div>
      );
    case "industry-carousel":
      return (
        <div className="flex h-full flex-col gap-1 p-1.5">
          <div className="flex justify-between gap-1">
            <div className={`${line} h-1 w-2/3`} />
            <div className="flex gap-0.5">
              <div className={`${box} h-2 w-2`} />
              <div className={`${box} h-2 w-2`} />
            </div>
          </div>
          <div className="flex flex-1 gap-0.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`${box} min-h-[1.5rem] flex-1 rounded-md`} />
            ))}
          </div>
        </div>
      );
    default:
      return <div className={`${box} m-1.5 min-h-[2rem]`} />;
  }
}

export function ComposedLayoutPresetPicker({
  value,
  onChange,
  disabled,
}: {
  value: ComposedLayoutPresetId;
  onChange: (id: ComposedLayoutPresetId) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold">Section structure</p>
      <p className="mt-0.5 text-[10px] text-muted">
        Pick a layout — AI writes copy from your prompt. One stock photo is used for all images.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {COMPOSED_LAYOUT_PRESETS.map((preset) => {
          const selected = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              title={preset.description}
              onClick={() => onChange(preset.id)}
              className={`flex flex-col overflow-hidden rounded-lg border text-left transition ${
                selected
                  ? "border-brand ring-2 ring-brand/30"
                  : "border-card-border hover:border-brand/40"
              }`}
            >
              <div className="aspect-[4/3] bg-neutral-100/90">
                <WireframeThumb id={preset.id} />
              </div>
              <span className="px-1.5 py-1 text-[9px] font-semibold leading-tight text-foreground">
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
