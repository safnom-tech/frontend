"use client";

import { useEditor } from "@/contexts/EditorContext";

export function SaveStatus() {
  const { saveStatus, saveError, dirty } = useEditor();

  if (saveStatus === "saving") {
    return <span className="text-xs text-muted">Saving…</span>;
  }
  if (saveStatus === "error") {
    return (
      <span className="text-xs text-red-600" title={saveError ?? undefined}>
        Couldn&apos;t save — tap Retry
      </span>
    );
  }
  if (dirty) {
    return <span className="text-xs text-amber-600">Saving soon…</span>;
  }
  if (saveStatus === "saved") {
    return <span className="text-xs text-emerald-600">All changes saved</span>;
  }
  return null;
}
