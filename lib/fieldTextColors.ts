import type { SectionStyleSettings } from "@/types/editor";

export function composedNodeFieldKey(nodePath: number[], prop: string): string {
  return `c:${nodePath.join(".")}:${prop}`;
}

export function arrayFieldTextKey(field: string, index: number): string {
  return `${field}.${index}`;
}

export function pipeItemPartFieldKey(
  field: string,
  index: number,
  part: "title" | "description"
): string {
  return `${field}.${index}.${part}`;
}

export function featureCardPartFieldKey(
  index: number,
  part: "title" | "body"
): string {
  return `cards.${index}.${part}`;
}

/** Section default, unless this field has its own override. */
export function resolveInlineTextColor(
  fieldKey: string,
  settings?: SectionStyleSettings | null
): string | undefined {
  if (!settings) return undefined;
  const override = settings.fieldTextColors?.[fieldKey];
  if (override) return override;
  return settings.textColor;
}

export function pickerHex(value: string | undefined, fallback: string): string {
  if (value?.startsWith("#") && value.length >= 4) {
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
      const r = value[1];
      const g = value[2];
      const b = value[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
  }
  return fallback.startsWith("#") && fallback.length >= 4 ? fallback : "#1a3a4a";
}
