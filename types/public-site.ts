import type { ApiSuccessResponse } from "@/types/api";
import type { PageSeo, PageSection } from "@/types/page";
import type { WebsiteTheme } from "@/types/website";

export interface PublicSitePageSummary {
  slug: string;
  name: string;
  pageType: string;
  seo: PageSeo;
}

export interface PublicSiteData {
  website: {
    publicId: string;
    name: string;
    description: string | null;
    theme: WebsiteTheme;
  };
  pages: PublicSitePageSummary[];
  page: {
    slug: string;
    name: string;
    pageType: string;
    seo: PageSeo;
    sections: PageSection[];
  };
}

export type PublicSiteResponse = ApiSuccessResponse<PublicSiteData>;
