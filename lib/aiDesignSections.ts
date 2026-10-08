/**
 * Catalog of importable AI design sections (layout is fixed; AI fills copy only).
 * Add new entries here — wire the same id in backend composed-layout.presets.ts.
 */
export const AI_DESIGN_SECTION_IDS = [
  "image-accordion",
  "industry-carousel",
] as const;

export type AiDesignSectionId = (typeof AI_DESIGN_SECTION_IDS)[number];

export type AiDesignSectionDef = {
  id: AiDesignSectionId;
  name: string;
  description: string;
  promptHint: string;
};

export const AI_DESIGN_SECTIONS: AiDesignSectionDef[] = [
  {
    id: "image-accordion",
    name: "Image + accordion",
    description:
      "Large photo beside a two-line headline, intro, and numbered expandable steps.",
    promptHint:
      "Describe your offer and explain your process in four clear steps.",
  },
  {
    id: "industry-carousel",
    name: "Industry carousel",
    description:
      "Bold heading with arrow controls and a row of labeled photo cards.",
    promptHint:
      "List the industries or audiences you serve (four short labels).",
  },
];

export const DEFAULT_AI_DESIGN_SECTION_ID: AiDesignSectionId = "image-accordion";

export function isAiDesignSectionId(id: string): id is AiDesignSectionId {
  return AI_DESIGN_SECTION_IDS.includes(id as AiDesignSectionId);
}

export function aiDesignSectionById(id: AiDesignSectionId): AiDesignSectionDef {
  return (
    AI_DESIGN_SECTIONS.find((s) => s.id === id) ?? AI_DESIGN_SECTIONS[0]!
  );
}

/** @deprecated use AiDesignSectionId */
export type ComposedLayoutPresetId = AiDesignSectionId;

export const COMPOSED_LAYOUT_PRESET_IDS = AI_DESIGN_SECTION_IDS;
export const DEFAULT_LAYOUT_PRESET_ID = DEFAULT_AI_DESIGN_SECTION_ID;

export const COMPOSED_LAYOUT_PRESETS = AI_DESIGN_SECTIONS.map((s) => ({
  id: s.id,
  label: s.name,
  description: s.description,
}));
