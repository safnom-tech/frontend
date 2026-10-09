import type { CSSProperties } from "react";
import type { PageSection, SectionType } from "@/types/page";
import type { SectionStyleSettings } from "@/types/editor";
import type { WebsiteTheme } from "@/types/website";

function sectionVariant(section: PageSection): string {
  const v = section.settings?.variant;
  return typeof v === "string" ? v : "default";
}

/** Ensure editor always has usable theme color keys for pickers + CSS vars. */
export function normalizeWebsiteTheme(
  theme?: WebsiteTheme | null
): WebsiteTheme {
  const c = theme?.colors ?? {};
  return {
    ...theme,
    colors: {
      primary: c.primary ?? "#3da6ad",
      secondary: c.secondary ?? "#1a3a4a",
      background: c.background ?? "#ffffff",
      text: c.text ?? "#1a3a4a",
    },
  };
}

/**
 * Standard theme tokens (same for every template):
 * - primary / secondary → brand + accent (buttons, links, icon highlights)
 * - background / text → light sections
 * - dark / dark-elevated / muted-bg → derived surfaces (headers, dark bands, soft gray blocks)
 */
export function themeCssVars(theme: {
  colors?: Record<string, string | undefined>;
}): CSSProperties {
  const c = normalizeWebsiteTheme(theme as WebsiteTheme).colors ?? {};
  const primary = c.primary ?? "#3da6ad";
  const secondary = c.secondary ?? "#1a3a4a";
  const background = c.background ?? "#ffffff";
  const text = c.text ?? "#1a3a4a";

  return {
    ["--editor-primary" as string]: primary,
    ["--editor-secondary" as string]: secondary,
    ["--editor-bg" as string]: background,
    ["--editor-text" as string]: text,
    ["--site-primary" as string]: primary,
    ["--site-secondary" as string]: secondary,
    ["--site-bg" as string]: background,
    ["--site-text" as string]: text,
    ["--site-on-dark" as string]: "#ffffff",
    ["--site-dark" as string]:
      "color-mix(in srgb, var(--site-primary) 36%, black)",
    ["--site-dark-elevated" as string]:
      "color-mix(in srgb, var(--site-primary) 18%, #121212)",
    ["--site-muted-bg" as string]:
      "color-mix(in srgb, var(--site-bg) 94%, var(--site-text) 6%)",
    ["--site-accent" as string]: "var(--site-primary)",
    ["--site-accent-soft" as string]:
      "color-mix(in srgb, var(--site-secondary) 22%, transparent)",
  };
}

const DARK_BAND_SURFACES: { type: SectionType; variants: string[] }[] = [
  { type: "HEADER", variants: ["logistics"] },
  { type: "HERO", variants: ["logistics"] },
  { type: "FOOTER", variants: ["logistics"] },
  { type: "SERVICES", variants: ["darkServiceGrid"] },
];

const LIGHT_MUTED_SURFACES: { type: SectionType; variants: string[] }[] = [
  { type: "FEATURES", variants: ["whyChoose"] },
  { type: "SERVICES", variants: ["serviceCards"] },
  { type: "CONTACT", variants: ["logistics"] },
];

function matchesSurface(
  section: PageSection,
  rules: { type: SectionType; variants: string[] }[]
): boolean {
  const variant = sectionVariant(section);
  return rules.some(
    (r) => r.type === section.type && r.variants.includes(variant)
  );
}

/** Map blocks to standard theme tokens (ignores stale template hex in settings). */
export function resolveSectionStyle(section: PageSection): CSSProperties {
  const base = getSectionStyles(section);
  const userBg = (section.settings as SectionStyleSettings)?.backgroundColor;

  if (userBg) {
    return {
      ...base,
      backgroundColor: userBg,
      color: base.color ?? "var(--site-text)",
    };
  }

  if (matchesSurface(section, DARK_BAND_SURFACES)) {
    return {
      ...base,
      backgroundColor: "var(--site-dark)",
      color: "var(--site-on-dark)",
    };
  }

  if (matchesSurface(section, LIGHT_MUTED_SURFACES)) {
    return {
      ...base,
      backgroundColor: "var(--site-muted-bg)",
      color: base.color ?? "var(--site-text)",
    };
  }

  if (base.backgroundColor || base.color) return base;

  return {
    ...base,
    backgroundColor: base.backgroundColor ?? "var(--site-bg)",
    color: base.color ?? "var(--site-text)",
  };
}

export function getSectionStyles(section: PageSection): CSSProperties {
  const s = section.settings as SectionStyleSettings;
  const align = s.alignment ?? "left";
  const py =
    s.paddingY === "none"
      ? "0"
      : s.paddingY === "sm"
        ? "1.5rem"
        : s.paddingY === "lg"
          ? "4rem"
          : "2.5rem";

  return {
    textAlign: align,
    paddingTop: py,
    paddingBottom: py,
    paddingLeft: s.paddingY === "none" ? "0" : "1.5rem",
    paddingRight: s.paddingY === "none" ? "0" : "1.5rem",
    color: s.textColor,
    backgroundColor: s.backgroundColor,
    fontSize:
      s.fontSize === "sm"
        ? "0.875rem"
        : s.fontSize === "lg"
          ? "1.125rem"
          : s.fontSize === "xl"
            ? "1.25rem"
            : undefined,
    fontWeight:
      s.fontWeight === "bold"
        ? 700
        : s.fontWeight === "medium"
          ? 600
          : undefined,
  };
}

/** Live website theme wins over preview/template defaults (e.g. after editor save). */
export function mergeWebsiteTheme(
  base?: WebsiteTheme,
  override?: WebsiteTheme
): WebsiteTheme {
  return {
    ...base,
    ...override,
    colors: { ...(base?.colors ?? {}), ...(override?.colors ?? {}) },
    typography: { ...(base?.typography ?? {}), ...(override?.typography ?? {}) },
    buttons: { ...(base?.buttons ?? {}), ...(override?.buttons ?? {}) },
  };
}

export function themeColorKey(theme: WebsiteTheme): string {
  return JSON.stringify(theme.colors ?? {});
}
