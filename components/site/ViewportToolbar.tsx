"use client";

import { VIEWPORT_OPTIONS } from "@/components/site/viewport";
import type { EditorViewport } from "@/types/editor";

export function ViewportToolbar({
  viewport,
  onViewportChange,
}: {
  viewport: EditorViewport;
  onViewportChange: (v: EditorViewport) => void;
}) {
  return (
    <div
      className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-b border-card-border bg-[#eef1f4] px-3 py-2"
      role="toolbar"
      aria-label="Preview screen size"
    >
      <span className="mr-1 hidden text-xs text-muted sm:inline">View as</span>
      {VIEWPORT_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onViewportChange(opt.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            viewport === opt.id
              ? "bg-white text-brand-deep shadow-sm ring-1 ring-black/10"
              : "text-muted hover:bg-white/60"
          }`}
        >
          {opt.label}
          <span className="ml-1 hidden font-normal opacity-70 md:inline">
            ({opt.width})
          </span>
        </button>
      ))}
    </div>
  );
}
