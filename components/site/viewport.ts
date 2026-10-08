import type { EditorViewport } from "@/types/editor";

export function isFullscreenViewport(viewport: EditorViewport): boolean {
  return viewport === "fullscreen";
}

export function previewFrameWidthClass(viewport: EditorViewport): string {
  switch (viewport) {
    case "tablet":
      return "w-full max-w-[768px]";
    case "mobile":
      return "w-full max-w-[390px]";
    case "fullscreen":
      return "w-full max-w-none";
    default:
      return "w-full max-w-[1200px]";
  }
}

export const VIEWPORT_OPTIONS: {
  id: EditorViewport;
  label: string;
  width: string;
}[] = [
  { id: "desktop", label: "Desktop", width: "1200px" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "mobile", label: "Mobile", width: "390px" },
  { id: "fullscreen", label: "Full screen", width: "No chrome" },
];
