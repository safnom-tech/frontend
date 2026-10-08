import type { PageSection, SectionType } from "@/types/page";
import type { Website, WebsiteTheme } from "@/types/website";

export type EditorViewport = "desktop" | "tablet" | "mobile" | "fullscreen";

export type EditorSaveStatus = "idle" | "saving" | "saved" | "error";

export type EditorThemeDraft = WebsiteTheme;

export interface SectionStyleSettings {
  alignment?: "left" | "center" | "right";
  fontSize?: "sm" | "md" | "lg" | "xl";
  fontWeight?: "normal" | "medium" | "bold";
  textColor?: string;
  /** Per-field text color overrides (field keys → hex). */
  fieldTextColors?: Record<string, string>;
  backgroundColor?: string;
  paddingY?: "none" | "sm" | "md" | "lg";
  /** HERO: centered stack vs two-column with image */
  layout?: "center" | "split";
  imagePosition?: "left" | "right";
  imageRadius?: "none" | "md" | "lg";
  /** Visual variant used by premium templates. */
  variant?:
    | "default"
    | "fashion"
    | "categoryStrip"
    | "trustBar"
    | "productGrid"
    | "promo"
    | "logistics"
    | "serviceCards"
    | "whyChoose"
    | "innovation"
    | "darkServiceGrid";
}

export interface EditorSnapshot {
  sections: PageSection[];
  theme: EditorThemeDraft;
}

export interface EditorState {
  website: Website | null;
  pageId: string | null;
  pageName: string;
  sections: PageSection[];
  selectedSectionId: string | null;
  viewport: EditorViewport;
  saveStatus: EditorSaveStatus;
  saveError: string | null;
  dirty: boolean;
  theme: EditorThemeDraft;
  loading: boolean;
  loadError: string | null;
}

export interface HeroSectionData {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface TextSectionData {
  heading?: string;
  body?: string;
}

export interface ImageSectionData {
  url?: string;
  alt?: string;
}

export function asRecord(data: Record<string, unknown>): Record<string, unknown> {
  return data;
}

export const SECTION_LIBRARY: { type: SectionType; label: string }[] = [
  { type: "HEADER", label: "Header" },
  { type: "HERO", label: "Hero" },
  { type: "TEXT", label: "Text" },
  { type: "IMAGE", label: "Image" },
  { type: "SERVICES", label: "Services" },
  { type: "FEATURES", label: "Features" },
  { type: "GALLERY", label: "Gallery" },
  { type: "TESTIMONIALS", label: "Testimonials" },
  { type: "PRICING", label: "Pricing" },
  { type: "FAQ", label: "FAQ" },
  { type: "CONTACT", label: "Contact" },
  { type: "FOOTER", label: "Footer" },
  { type: "COMPOSED", label: "Custom (AI)" },
];
