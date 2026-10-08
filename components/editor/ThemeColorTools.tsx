"use client";

import { useMemo, useState } from "react";
import { normalizeWebsiteTheme } from "@/components/editor/sections/sectionStyles";
import { collectThemeColorSwatches } from "@/lib/themeColorReplace";
import { useEditor } from "@/contexts/EditorContext";
import { confirmAction } from "@/lib/confirm";

const COLOR_KEYS = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "background", label: "Background" },
  { key: "text", label: "Text" },
] as const;

function themeColorsEqual(
  a: ReturnType<typeof normalizeWebsiteTheme>,
  b: ReturnType<typeof normalizeWebsiteTheme>
): boolean {
  return (
    JSON.stringify(a.colors ?? {}) === JSON.stringify(b.colors ?? {})
  );
}

export function ThemeColorTools() {
  const {
    theme,
    sections,
    defaultTheme,
    useDefaultThemeColors,
    setUseDefaultThemeColors,
    resetThemeColorsToDefault,
    setThemeColorKey,
    replaceThemeColor,
  } = useEditor();
  const liveTheme = normalizeWebsiteTheme(theme);
  const baseline = normalizeWebsiteTheme(defaultTheme);
  const colors = liveTheme.colors ?? {};
  const defaultColors = baseline.colors ?? {};
  const isCustom = !useDefaultThemeColors && !themeColorsEqual(liveTheme, baseline);
  const swatches = useMemo(
    () => collectThemeColorSwatches(liveTheme, sections),
    [liveTheme, sections]
  );
  const [selectedSwatch, setSelectedSwatch] = useState<string | null>(null);
  const [replacement, setReplacement] = useState("#3da6ad");
  const pickersDisabled = useDefaultThemeColors;

  return (
    <div>
      <p className="mb-3 text-[11px] leading-snug text-muted">
        <strong className="font-medium text-[var(--editor-text,#1a3a4a)]">
          Standard roles (all themes):
        </strong>{" "}
        Primary tints dark bands; secondary is accent only. Background and text
        apply to light sections.
      </p>

      <div className="mb-3 rounded-lg border border-card-border bg-black/[0.02] p-2.5">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={useDefaultThemeColors}
            onChange={(e) => setUseDefaultThemeColors(e.target.checked)}
          />
          <span className="text-[11px] leading-snug">
            <span className="font-medium">Use site default colors</span>
            <span className="mt-0.5 block text-muted">
              Original palette for this website (from when you opened the
              editor).
            </span>
          </span>
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium text-muted">Defaults:</span>
          {COLOR_KEYS.map(({ key }) => {
            const hex = defaultColors[key] ?? "#ccc";
            return (
              <span
                key={key}
                title={`${key}: ${hex}`}
                className="h-5 w-5 rounded border border-black/10"
                style={{ background: hex }}
              />
            );
          })}
          <button
            type="button"
            className="ml-auto rounded-md border border-card-border px-2 py-0.5 text-[10px] font-semibold hover:bg-black/[0.04]"
            onClick={() => resetThemeColorsToDefault()}
          >
            Restore defaults
          </button>
        </div>
        {isCustom ? (
          <p className="mt-2 text-[10px] text-brand">Custom colors active</p>
        ) : null}
      </div>

      <div
        className={`mb-3 grid grid-cols-2 gap-2 ${pickersDisabled ? "pointer-events-none opacity-55" : ""}`}
      >
        {COLOR_KEYS.map(({ key, label }) => {
          const value = colors[key] ?? "";
          const pickerValue =
            value.startsWith("#") && value.length >= 4 ? value : "#cccccc";
          return (
            <label
              key={key}
              className="flex items-center gap-2 rounded-lg border border-card-border px-2 py-1.5 text-[11px]"
            >
              <input
                type="color"
                value={pickerValue}
                disabled={pickersDisabled}
                onChange={(e) => setThemeColorKey(key, e.target.value)}
                className="h-7 w-7 shrink-0 cursor-pointer rounded border border-black/10 disabled:cursor-not-allowed"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{label}</span>
                <span className="font-mono text-[10px] text-muted">
                  {value || "—"}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {swatches.length > 0 && !pickersDisabled ? (
        <div className="rounded-lg bg-black/[0.03] p-2.5">
          <p className="mb-2 text-[10px] font-medium text-muted">
            Colors used on this page
          </p>
          <div className="flex flex-wrap gap-1.5">
            {swatches.map((hex) => (
              <button
                key={hex}
                type="button"
                title={hex}
                onClick={() => {
                  setSelectedSwatch(hex);
                  setReplacement(hex);
                }}
                className={`h-7 w-7 rounded-md border-2 ${
                  selectedSwatch === hex
                    ? "border-brand ring-2 ring-brand/30"
                    : "border-white shadow-sm"
                }`}
                style={{ background: hex }}
              />
            ))}
          </div>
          {selectedSwatch ? (
            <div className="mt-2.5 space-y-2">
              <p className="text-[10px] text-muted">
                Replace{" "}
                <span className="font-mono font-semibold text-[var(--editor-text,#1a3a4a)]">
                  {selectedSwatch}
                </span>{" "}
                across theme and blocks:
              </p>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={
                    replacement.startsWith("#") ? replacement : "#000000"
                  }
                  onChange={(e) => setReplacement(e.target.value)}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded border border-black/10"
                />
                <input
                  type="text"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  className="min-w-0 flex-1 rounded-md border border-card-border px-2 py-1 font-mono text-xs"
                />
                <button
                  type="button"
                  className="shrink-0 rounded-md bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold text-white"
                  onClick={() => {
                    void (async () => {
                      if (
                        !(await confirmAction({
                          title: "Replace color site-wide?",
                          message: `Every use of ${selectedSwatch} will become ${replacement} on this site.`,
                          confirmLabel: "Replace all",
                        }))
                      ) {
                        return;
                      }
                      replaceThemeColor(selectedSwatch, replacement);
                      setSelectedSwatch(replacement);
                    })();
                  }}
                >
                  Replace
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
