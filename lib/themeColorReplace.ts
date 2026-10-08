import { normalizeWebsiteTheme } from "@/components/editor/sections/sectionStyles";
import type { PageSection } from "@/types/page";
import type { WebsiteTheme } from "@/types/website";

export type ThemeColorKey = "primary" | "secondary" | "background" | "text";

function normalizeHex(color: string): string {
  const c = color.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(c)) {
    return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
  }
  return c;
}

function replaceInValue(value: unknown, from: string, to: string): unknown {
  if (typeof value === "string") {
    if (normalizeHex(value) === from) return to;
    if (value.toLowerCase() === from) return to;
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceInValue(item, from, to));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = replaceInValue(v, from, to);
    }
    return out;
  }
  return value;
}

export function collectThemeColorSwatches(
  theme: WebsiteTheme,
  sections: PageSection[]
): string[] {
  const set = new Set<string>();
  for (const v of Object.values(theme.colors ?? {})) {
    if (typeof v === "string" && v.trim()) set.add(normalizeHex(v.trim()));
  }
  for (const s of sections) {
    const settings = s.settings ?? {};
    for (const key of ["backgroundColor", "textColor"] as const) {
      const v = settings[key];
      if (typeof v === "string" && v.trim().startsWith("#")) {
        set.add(normalizeHex(v.trim()));
      }
    }
  }
  return [...set].sort();
}

export function applyThemeColorKeyChange(
  theme: WebsiteTheme,
  sections: PageSection[],
  key: ThemeColorKey,
  value: string
): { theme: WebsiteTheme; sections: PageSection[] } {
  const normalized = normalizeWebsiteTheme(theme);
  const colors = normalized.colors ?? {};
  const oldValue = colors[key];
  let nextTheme = normalizeWebsiteTheme({
    ...normalized,
    colors: { ...colors, [key]: value },
  });
  let nextSections = sections;
  if (
    typeof oldValue === "string" &&
    oldValue.trim() &&
    normalizeHex(oldValue) !== normalizeHex(value)
  ) {
    const applied = replaceColorAcrossSite(nextTheme, sections, oldValue, value);
    nextTheme = normalizeWebsiteTheme({
      ...applied.theme,
      colors: { ...(applied.theme.colors ?? {}), [key]: value },
    });
    nextSections = applied.sections;
  }
  return { theme: nextTheme, sections: nextSections };
}

export function replaceColorAcrossSite(
  theme: WebsiteTheme,
  sections: PageSection[],
  fromColor: string,
  toColor: string
): { theme: WebsiteTheme; sections: PageSection[] } {
  const from = normalizeHex(fromColor);
  const to = toColor.trim();
  const nextTheme = replaceInValue(theme, from, to) as WebsiteTheme;
  const nextSections = sections.map((s) => ({
    ...s,
    data: replaceInValue(s.data, from, to) as Record<string, unknown>,
    settings: replaceInValue(s.settings ?? {}, from, to) as Record<
      string,
      unknown
    >,
  }));
  return { theme: nextTheme, sections: nextSections };
}
