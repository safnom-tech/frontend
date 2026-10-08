import type { BrandPalette, BrandThemeConfig } from "@/config/brand";
import { defaultBrandTheme } from "@/config/brand";

/** CSS variable names consumed by globals.css and Tailwind theme */
const PALETTE_VAR_MAP: Record<keyof BrandPalette, string> = {
  deep: "--brand-deep",
  primary: "--brand",
  light: "--brand-light",
  glow: "--accent-soft",
  silver: "--muted-brand",
  canvasDark: "--brand-canvas-dark",
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return null;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) {
    return null;
  }
  return { r, g, b };
}

function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return hex;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function applyBrandTheme(
  config: BrandThemeConfig = defaultBrandTheme
): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const { palette } = config;

  for (const [key, cssVar] of Object.entries(PALETTE_VAR_MAP) as [
    keyof BrandPalette,
    string,
  ][]) {
    root.style.setProperty(cssVar, palette[key]);
  }

  root.style.setProperty("--accent", palette.primary);
  root.style.setProperty("--surface-glow", rgba(palette.primary, 0.14));
  root.style.setProperty("--brand-focus-ring", rgba(palette.primary, 0.22));
  root.style.setProperty("--btn-shadow", rgba(palette.primary, 0.28));
  root.style.setProperty("--btn-shadow-hover", rgba(palette.primary, 0.38));
}

/** Merge partial palette — useful for future admin/API theme editor */
export function mergeBrandTheme(
  overrides: Partial<BrandPalette>
): BrandThemeConfig {
  return {
    ...defaultBrandTheme,
    palette: { ...defaultBrandTheme.palette, ...overrides },
  };
}
