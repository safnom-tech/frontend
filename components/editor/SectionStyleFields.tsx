"use client";

import { FieldLabel, Input } from "@/components/ui/Input";
import type { SectionStyleSettings } from "@/types/editor";

export function SectionStyleFields({
  settings,
  onChange,
}: {
  settings: SectionStyleSettings;
  onChange: (next: SectionStyleSettings) => void;
}) {
  return (
    <div className="space-y-3 border-t border-card-border pt-3">
      <p className="text-xs font-semibold uppercase text-muted">Style</p>
      <div>
        <FieldLabel>Alignment</FieldLabel>
        <select
          className="input-field w-full rounded-lg text-sm"
          value={settings.alignment ?? "left"}
          onChange={(e) =>
            onChange({
              ...settings,
              alignment: e.target.value as SectionStyleSettings["alignment"],
            })
          }
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div>
        <FieldLabel>Font size</FieldLabel>
        <select
          className="input-field w-full rounded-lg text-sm"
          value={settings.fontSize ?? "md"}
          onChange={(e) =>
            onChange({
              ...settings,
              fontSize: e.target.value as SectionStyleSettings["fontSize"],
            })
          }
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
          <option value="xl">Extra large</option>
        </select>
      </div>
      <div>
        <FieldLabel>Font weight</FieldLabel>
        <select
          className="input-field w-full rounded-lg text-sm"
          value={settings.fontWeight ?? "normal"}
          onChange={(e) =>
            onChange({
              ...settings,
              fontWeight: e.target.value as SectionStyleSettings["fontWeight"],
            })
          }
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="bold">Bold</option>
        </select>
      </div>
      <div>
        <FieldLabel>Text color</FieldLabel>
        <Input
          type="text"
          placeholder="#1a3a4a"
          value={settings.textColor ?? ""}
          onChange={(e) =>
            onChange({ ...settings, textColor: e.target.value || undefined })
          }
        />
      </div>
      <div>
        <FieldLabel>Background</FieldLabel>
        <Input
          type="text"
          placeholder="#ffffff"
          value={settings.backgroundColor ?? ""}
          onChange={(e) =>
            onChange({
              ...settings,
              backgroundColor: e.target.value || undefined,
            })
          }
        />
      </div>
      <div>
        <FieldLabel>Vertical padding</FieldLabel>
        <select
          className="input-field w-full rounded-lg text-sm"
          value={settings.paddingY ?? "md"}
          onChange={(e) =>
            onChange({
              ...settings,
              paddingY: e.target.value as SectionStyleSettings["paddingY"],
            })
          }
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>
    </div>
  );
}
