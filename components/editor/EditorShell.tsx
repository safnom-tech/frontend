"use client";

import { EditorGettingStartedChecklist } from "@/components/editor/EditorGettingStartedChecklist";
import { EditorSidePanel } from "@/components/editor/EditorSidePanel";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { WebsiteCanvas } from "@/components/editor/WebsiteCanvas";
import { Alert } from "@/components/ui/Alert";
import { useEditor } from "@/contexts/EditorContext";

export function EditorShell() {
  const { loading, loadError, previewMode, viewport } = useEditor();
  const immersivePreview =
    previewMode && viewport === "fullscreen";

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Loading your page…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Alert tone="error">{loadError}</Alert>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {!immersivePreview ? <EditorToolbar /> : null}
      {!immersivePreview ? <EditorGettingStartedChecklist /> : null}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <WebsiteCanvas />
        {!previewMode ? <EditorSidePanel /> : null}
      </div>
    </div>
  );
}
