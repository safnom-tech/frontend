export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "safnom-theme";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  if (value === "light" || value === "dark") {
    return value;
  }
  return null;
}

/** Default product theme when the user has not chosen one yet. */
export function getDefaultTheme(): Theme {
  return "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}
