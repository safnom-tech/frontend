import type { ApiSuccessResponse } from "@/types/api";
import type { Page } from "@/types/page";
import type { ComposedSectionDefinition } from "@/types/composed-section";
import type { Website } from "@/types/website";

export type AiSectionAction =
  | "generate"
  | "rewrite"
  | "shorten"
  | "professional"
  | "generate_about"
  | "generate_services"
  | "generate_faqs"
  | "create_from_prompt"
  | "edit_from_prompt"
  | "seo_title"
  | "seo_description";

export type ComposedSectionTypeHint =
  | "hero"
  | "about"
  | "services"
  | "features"
  | "portfolio"
  | "testimonials"
  | "pricing"
  | "contact"
  | "faq"
  | "team"
  | "custom";

export type ComposedDesignStyle =
  | "modern"
  | "minimal"
  | "premium"
  | "editorial"
  | "corporate"
  | "creative"
  | "luxury"
  | "bold"
  | "glassmorphism"
  | "custom";

export interface BusinessContextInput {
  businessName?: string;
  businessType?: string;
  businessDescription?: string;
  location?: string;
  services?: string[];
  websiteStyle?: string;
}

export interface GenerateWebsiteInput {
  businessName: string;
  businessType: string;
  businessDescription: string;
  location: string;
  services: string[];
  websiteStyle: string;
}

export interface SectionActionInput {
  action: AiSectionAction;
  websiteId: string;
  pageId: string;
  sectionId?: string;
  sectionType?: string;
  content?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  prompt?: string;
  businessContext?: BusinessContextInput;
}

export type ComposedLayoutPresetId =
  import("@/lib/aiDesignSections").AiDesignSectionId;

export interface ComposedSectionGenerateInput {
  websiteId: string;
  pageId: string;
  prompt: string;
  sectionTypeHint?: ComposedSectionTypeHint;
  designStyle?: ComposedDesignStyle;
  additionalRequirements?: string[];
  layoutPresetId?: ComposedLayoutPresetId;
  businessContext?: BusinessContextInput;
  currentSection?: ComposedSectionDefinition;
}

export type GenerateWebsiteResponse = ApiSuccessResponse<{
  website: Website;
  pages: Page[];
}>;

export type SectionActionResponse = ApiSuccessResponse<{
  type?: string;
  data?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  seo?: {
    title?: string | null;
    metaDescription?: string | null;
  };
}>;

export type FieldContentType =
  | "heading"
  | "subheading"
  | "title"
  | "eyebrow"
  | "description"
  | "body"
  | "button"
  | "quote"
  | "author"
  | "planName"
  | "price"
  | "copyright"
  | "navLabel"
  | "logoText"
  | "alt"
  | "generic";

export interface FieldContentGenerateInput {
  prompt: string;
  fieldType: FieldContentType;
  maxChars?: number;
  maxWords?: number;
  currentValue?: string;
  regenerate?: boolean;
  businessContext?: BusinessContextInput;
}

export type FieldContentGenerateResponse = ApiSuccessResponse<{
  content: string;
}>;

export type ComposedSectionResponse = ApiSuccessResponse<{
  section: ComposedSectionDefinition;
  type: "COMPOSED";
  data: Record<string, unknown>;
  settings?: Record<string, unknown>;
}>;
