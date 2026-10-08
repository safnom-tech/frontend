"use client";

import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-card-border bg-card/60 p-1 backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
          theme === "light"
            ? "bg-brand/15 text-brand-deep dark:bg-brand/25 dark:text-accent-soft"
            : "text-muted hover:text-foreground"
        }`}
        aria-pressed={theme === "light"}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
          theme === "dark"
            ? "bg-brand/15 text-brand-deep dark:bg-brand/25 dark:text-accent-soft"
            : "text-muted hover:text-foreground"
        }`}
        aria-pressed={theme === "dark"}
      >
        Dark
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="ml-0.5 rounded-lg p-1.5 text-muted hover:bg-card hover:text-foreground sm:hidden"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
