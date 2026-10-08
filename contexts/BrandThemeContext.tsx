"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultBrandTheme,
  type BrandPalette,
  type BrandThemeConfig,
} from "@/config/brand";
import { applyBrandTheme, mergeBrandTheme } from "@/lib/apply-brand-theme";

const BRAND_STORAGE_KEY = "safnom-brand-overrides";

interface BrandThemeContextValue {
  theme: BrandThemeConfig;
  /** Replace entire palette (e.g. from API later) */
  setBrandTheme: (config: BrandThemeConfig) => void;
  /** Patch individual colors without losing the rest */
  updatePalette: (patch: Partial<BrandPalette>) => void;
  resetBrandTheme: () => void;
}

const BrandThemeContext = createContext<BrandThemeContextValue | null>(null);

function loadStoredOverrides(): Partial<BrandPalette> | null {
  try {
    const raw = localStorage.getItem(BRAND_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as Partial<BrandPalette>;
  } catch {
    return null;
  }
}

export function BrandThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<BrandThemeConfig>(defaultBrandTheme);

  useEffect(() => {
    const overrides = loadStoredOverrides();
    const initial = overrides
      ? mergeBrandTheme(overrides)
      : defaultBrandTheme;
    setTheme(initial);
    applyBrandTheme(initial);
  }, []);

  const setBrandTheme = useCallback((config: BrandThemeConfig) => {
    setTheme(config);
    applyBrandTheme(config);
  }, []);

  const updatePalette = useCallback((patch: Partial<BrandPalette>) => {
    setTheme((prev) => {
      const next = {
        ...prev,
        palette: { ...prev.palette, ...patch },
      };
      applyBrandTheme(next);
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(next.palette));
      return next;
    });
  }, []);

  const resetBrandTheme = useCallback(() => {
    localStorage.removeItem(BRAND_STORAGE_KEY);
    setTheme(defaultBrandTheme);
    applyBrandTheme(defaultBrandTheme);
  }, []);

  const value = useMemo(
    () => ({ theme, setBrandTheme, updatePalette, resetBrandTheme }),
    [theme, setBrandTheme, updatePalette, resetBrandTheme]
  );

  return (
    <BrandThemeContext.Provider value={value}>
      {children}
    </BrandThemeContext.Provider>
  );
}

export function useBrandTheme(): BrandThemeContextValue {
  const ctx = useContext(BrandThemeContext);
  if (!ctx) {
    throw new Error("useBrandTheme must be used within BrandThemeProvider");
  }
  return ctx;
}
