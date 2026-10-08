"use client";

import { useParams } from "next/navigation";
import { EditorShell } from "@/components/editor/EditorShell";
import { EditorProvider } from "@/contexts/EditorContext";

export default function VisualEditorPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const pageId = params.pageId as string;

  return (
    <EditorProvider websiteId={websiteId} pageId={pageId}>
      <EditorShell />
    </EditorProvider>
  );
}
