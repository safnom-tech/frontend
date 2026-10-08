import type { ApiSuccessResponse } from "@/types/api";

export type PageType = "HOME" | "ABOUT" | "SERVICES" | "CONTACT" | "CUSTOM";
export type PageStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export type SectionType =
  | "HEADER"
  | "HERO"
  | "TEXT"
  | "IMAGE"
  | "SERVICES"
  | "FEATURES"
  | "GALLERY"
  | "TESTIMONIALS"
  | "PRICING"
  | "FAQ"
  | "CONTACT"
  | "FOOTER"
  | "COMPOSED";

export interface PageSeo {
  title: string | null;
  metaDescription: string | null;
  socialImage: string | null;
}

export interface PageSection {
  id: string;
  type: SectionType;
  order: number;
  data: Record<string, unknown>;
  settings: Record<string, unknown>;
}

export interface Page {
  id: string;
  workspaceId: string;
  websiteId: string;
  name: string;
  slug: string;
  pageType: PageType;
  status: PageStatus;
  seo: PageSeo;
  sections: PageSection[];
  createdAt: string;
  updatedAt: string;
}

export type PagesListResponse = ApiSuccessResponse<{ pages: Page[] }>;
export type PageResponse = ApiSuccessResponse<Page>;
export type SectionResponse = ApiSuccessResponse<PageSection>;
export type SectionsReorderResponse = ApiSuccessResponse<{
  sections: PageSection[];
}>;
