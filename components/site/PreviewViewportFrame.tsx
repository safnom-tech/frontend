"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  isFullscreenViewport,
  previewFrameWidthClass,
} from "@/components/site/viewport";
import type { EditorViewport } from "@/types/editor";

export function previewMainClassName(viewport: EditorViewport): string {
  if (isFullscreenViewport(viewport)) {
    return "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-white p-0 touch-pan-y";
  }
  return "flex min-h-0 flex-1 flex-col items-center overflow-y-auto overscroll-y-contain bg-[#c8ced4] p-4 sm:p-8 touch-pan-y";
}

export function previewFrameClassName(viewport: EditorViewport): string {
  const width = previewFrameWidthClass(viewport);
  if (isFullscreenViewport(viewport)) {
    return "min-h-0 w-full shrink-0 bg-white";
  }
  if (viewport === "mobile" || viewport === "tablet") {
    return `max-h-[calc(100dvh-10rem)] w-full shrink-0 overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y rounded-xl bg-white shadow-lg ring-1 ring-black/10 ${width}`;
  }
  return `min-h-[min(100dvh-10rem,900px)] w-full shrink-0 bg-white shadow-lg ring-1 ring-black/10 ${width}`;
}

export function showMobilePreviewChrome(viewport: EditorViewport): boolean {
  return viewport === "mobile";
}

export function FullscreenPreviewControls({
  viewport,
  onViewportChange,
  children,
}: {
  viewport: EditorViewport;
  onViewportChange: (v: EditorViewport) => void;
  children?: ReactNode;
}) {
  useEffect(() => {
    if (!isFullscreenViewport(viewport)) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onViewportChange("desktop");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewport, onViewportChange]);

  if (!isFullscreenViewport(viewport)) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] flex justify-end p-3 sm:justify-center">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-black/10 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
        <span className="hidden font-medium text-muted sm:inline">
          Full screen preview
        </span>
        {children}
        <button
          type="button"
          className="rounded-full bg-neutral-900 px-3 py-1.5 font-semibold text-white hover:bg-neutral-800"
          onClick={() => onViewportChange("desktop")}
        >
          Exit full screen
        </button>
      </div>
    </div>
  );
}
