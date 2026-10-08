import type { ApiSuccessResponse } from "@/types/api";
import type { PageType } from "@/types/page";

export type TemplateCategory =
  | "Business"
  | "Agency"
  | "Restaurant"
  | "Portfolio"
  | "Professional Services"
  | "Fashion"
  | "Logistics";

export interface TemplateSummary {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  /** Static CDN thumb when set — avoids live render on theme grids at scale */
  previewThumbnailUrl?: string | null;
}

export interface TemplateDetail extends TemplateSummary {
  theme: Record<string, unknown>;
  pages: Array<{
    name: string;
    slug: string;
    pageType: PageType;
    sections: Array<{
      type: string;
      order: number;
      data: Record<string, unknown>;
      settings: Record<string, unknown>;
    }>;
  }>;
}

export type TemplatesListResponse = ApiSuccessResponse<{
  templates: TemplateSummary[];
  total: number;
  limit: number;
  offset: number;
}>;
export type TemplateResponse = ApiSuccessResponse<TemplateDetail>;
