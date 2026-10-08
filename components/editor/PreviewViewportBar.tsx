"use client";

import { ViewportToolbar } from "@/components/site/ViewportToolbar";
import { useEditor } from "@/contexts/EditorContext";

export { previewFrameWidthClass } from "@/components/site/viewport";

export function PreviewViewportBar() {
  const { viewport, setViewport } = useEditor();
  return (
    <ViewportToolbar viewport={viewport} onViewportChange={setViewport} />
  );
}
