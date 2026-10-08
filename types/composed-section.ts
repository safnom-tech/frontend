export type ComposedElementType =
  | "container"
  | "grid"
  | "flex"
  | "heading"
  | "text"
  | "image"
  | "button"
  | "icon"
  | "card"
  | "badge"
  | "avatar"
  | "stats"
  | "form"
  | "input"
  | "video"
  | "gallery"
  | "tabs"
  | "accordion"
  | "carousel"
  | "divider"
  | "socialLinks"
  | "spacer";

export type ComposedNode = {
  type: ComposedElementType;
  props?: Record<string, unknown>;
  children?: ComposedNode[];
};

export type ComposedSectionDefinition = {
  semanticType: string;
  layout: string;
  theme?: {
    style?: string;
    spacing?: "compact" | "medium" | "large";
    borderRadius?: "none" | "small" | "medium" | "large";
    background?: "default" | "muted" | "primary" | "gradient" | "dark";
  };
  content?: {
    eyebrow?: string;
    title?: string;
    description?: string;
  };
  root: ComposedNode;
  responsive?: {
    desktop?: Record<string, unknown>;
    tablet?: Record<string, unknown>;
    mobile?: Record<string, unknown>;
  };
  animations?: string[];
};

export function parseComposedSectionFromData(
  data: Record<string, unknown>
): ComposedSectionDefinition | null {
  const section = data.section;
  if (!section || typeof section !== "object") return null;
  const root = (section as ComposedSectionDefinition).root;
  if (!root || typeof root !== "object") return null;
  return section as ComposedSectionDefinition;
}
