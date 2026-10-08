"use client";

import { useOptionalEditor } from "@/contexts/EditorContext";
import type { BusinessContextInput } from "@/types/ai";

export function useEditorBusinessContext(): BusinessContextInput | undefined {
  const editor = useOptionalEditor();
  const website = editor?.website;
  if (!website) return undefined;
  return {
    businessName: website.name,
    businessDescription: website.description ?? undefined,
  };
}
