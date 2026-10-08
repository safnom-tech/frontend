import type { ApiSuccessResponse } from "@/types/api";
import type { WorkspaceBusinessProfile } from "@/types/business-profile";
import type { Page, PageSeo, PageType } from "@/types/page";
import type { TemplateCategory } from "@/types/template";
import type { Website, WebsiteTheme } from "@/types/website";

export interface PreviewPageSummary {
  id: string;
  name: string;
  slug: string;
  pageType: PageType;
  seo: PageSeo;
}

export interface WebsitePreviewData {
  website: Website;
  pages: PreviewPageSummary[];
  page: Page;
}

export type WebsitePreviewResponse = ApiSuccessResponse<WebsitePreviewData>;

/** Theme card / full-page preview with workspace business profile applied */
export interface TemplateThemePreviewPage {
  name: string;
  slug: string;
  pageType: PageType;
  seo: PageSeo;
  sections: Page["sections"];
}

export interface TemplateThemePreviewData {
  template: {
    id: string;
    name: string;
    category: TemplateCategory;
    description: string;
  };
  theme: WebsiteTheme;
  page: TemplateThemePreviewPage;
  businessProfileApplied: boolean;
  businessProfile: WorkspaceBusinessProfile;
}

export type TemplateThemePreviewResponse =
  ApiSuccessResponse<TemplateThemePreviewData>;
