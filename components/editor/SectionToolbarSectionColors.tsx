"use client";

import { normalizeWebsiteTheme } from "@/components/editor/sections/sectionStyles";
import type { EditorThemeDraft, SectionStyleSettings } from "@/types/editor";

function pickerHex(value: string | undefined, fallback: string): string {
  if (value?.startsWith("#") && value.length >= 4) {
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
      const r = value[1];
      const g = value[2];
      const b = value[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
  }
  return fallback.startsWith("#") && fallback.length >= 4 ? fallback : "#ffffff";
}

function ColorPicker({
  label,
  ariaLabel,
  value,
  fallback,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value?: string;
  fallback: string;
  onChange: (hex: string) => void;
}) {
  const display = pickerHex(value, fallback);
  return (
    <label
      className="flex cursor-pointer items-center gap-1.5 rounded-md border border-card-border bg-white px-2 py-1"
      title={label}
    >
      <input
        type="color"
        value={display}
        aria-label={ariaLabel}
        className="h-6 w-6 shrink-0 cursor-pointer rounded border border-black/10 p-0.5"
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="text-[10px] font-semibold text-muted">{label}</span>
    </label>
  );
}

export function SectionToolbarSectionColors({
  theme,
  settings,
  onChange,
}: {
  theme: EditorThemeDraft;
  settings: SectionStyleSettings;
  onChange: (patch: Partial<SectionStyleSettings>) => void;
}) {
  const colors = normalizeWebsiteTheme(theme).colors ?? {};
  const pageBg = colors.background ?? "#ffffff";
  const pageText = colors.text ?? "#1a3a4a";
  const hasBgOverride = Boolean(settings.backgroundColor);
  const hasTextOverride = Boolean(settings.textColor);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <ColorPicker
        label="Background"
        ariaLabel="Section background color"
        value={settings.backgroundColor}
        fallback={pageBg}
        onChange={(backgroundColor) => onChange({ backgroundColor })}
      />
      <ColorPicker
        label="All text"
        ariaLabel="Default text color for this section"
        value={settings.textColor}
        fallback={pageText}
        onChange={(textColor) => onChange({ textColor })}
      />
      {hasBgOverride || hasTextOverride ? (
        <button
          type="button"
          className="rounded-md px-2 py-1 text-[10px] font-semibold text-muted hover:bg-black/[0.04]"
          onClick={() =>
            onChange({
              backgroundColor: undefined,
              textColor: undefined,
            })
          }
        >
          Reset section colors
        </button>
      ) : null}
    </div>
  );
}
