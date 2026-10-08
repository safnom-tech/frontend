"use client";

import { THEME_PRESETS } from "@/components/editor/editorUiConstants";
import { useEditor } from "@/contexts/EditorContext";

export function SimpleThemeSettings() {
  const { theme, updateTheme } = useEditor();
  const colors = theme.colors ?? {};

  const activePresetId =
    THEME_PRESETS.find(
      (p) =>
        JSON.stringify(p.theme.colors) === JSON.stringify(colors) &&
        Object.keys(p.theme.colors ?? {}).length > 0
    )?.id ?? null;

  return (
    <section className="p-3">
      <p className="mb-1 text-xs font-medium text-muted">Site colors</p>
      <p className="mb-3 text-[11px] leading-snug text-muted">
        Pick a look — no custom design needed.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {THEME_PRESETS.map((preset) => {
          const primary = preset.theme.colors?.primary ?? "#3da6ad";
          const bg = preset.theme.colors?.background ?? "#fff";
          const selected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                updateTheme({
                  ...theme,
                  ...preset.theme,
                  colors: {
                    ...(theme.colors ?? {}),
                    ...(preset.theme.colors ?? {}),
                  },
                })
              }
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs ${
                selected
                  ? "border-brand ring-1 ring-brand/40"
                  : "border-card-border hover:border-brand/30"
              }`}
            >
              <span className="flex shrink-0 overflow-hidden rounded-md border border-black/10">
                <span className="h-6 w-6" style={{ background: primary }} />
                <span className="h-6 w-6" style={{ background: bg }} />
              </span>
              <span className="font-medium">{preset.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
