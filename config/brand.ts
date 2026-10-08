/**
 * SafNom brand tokens — single source of truth for logo + colors.
 * Update this file (or load from API later) to retheme the whole app.
 */

/** All-caps wordmark in UI (matches logo) */
export const brandWordmarkText = "SAFNOM";

export const brandLogo = {
  src: "/brand/safnom-logo.jpg",
  /** Square SN mark — favicon / app icons */
  iconSrc: "/brand/safnom-icon-square.png",
  alt: "SafNom — AI Website Builder",
  /** Display height in header (width scales automatically) */
  headerHeight: 44,
  /** Larger hero / auth usage */
  heroHeight: 56,
} as const;

export interface BrandPalette {
  /** Deep navy from logo shadow */
  deep: string;
  /** Primary teal */
  primary: string;
  /** Mint highlight */
  light: string;
  /** Cyan glow / network nodes */
  glow: string;
  /** Muted silver tagline tone */
  silver: string;
  /** Dark canvas from logo background */
  canvasDark: string;
}

/** Colors sampled from official SafNom logo artwork */
export const defaultBrandPalette: BrandPalette = {
  deep: "#1a3a4a",
  primary: "#3da6ad",
  light: "#a1d9b4",
  glow: "#84f2f0",
  silver: "#b0bec5",
  canvasDark: "#0b1318",
};

export type BrandThemeMode = "light" | "dark";

export interface BrandThemeConfig {
  palette: BrandPalette;
  logo: typeof brandLogo;
}

export const defaultBrandTheme: BrandThemeConfig = {
  palette: defaultBrandPalette,
  logo: brandLogo,
};
