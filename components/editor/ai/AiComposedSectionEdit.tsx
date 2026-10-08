"use client";

import { EditSectionWithAi } from "@/components/editor/ai/EditSectionWithAi";
import { useEditor } from "@/contexts/EditorContext";
import type { PageSection } from "@/types/page";

/** Sidebar entry for section AI edit (all section types). */
export function AiComposedSectionEdit({ section }: { section: PageSection }) {
  const { updateSectionData, updateSectionSettings } = useEditor();

  return (
    <EditSectionWithAi
      section={section}
      variant="panel"
      onApply={({ data, settings }) => {
        if (data) updateSectionData(section.id, data);
        if (settings) updateSectionSettings(section.id, settings);
      }}
    />
  );
}
