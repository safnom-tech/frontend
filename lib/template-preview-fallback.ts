import type { TemplateThemePreviewData } from "@/types/preview";
import type { TemplateDetail } from "@/types/template";
import type { WebsiteTheme } from "@/types/website";
import type { WorkspaceBusinessProfile } from "@/types/business-profile";
import type { PageSection, SectionType } from "@/types/page";

function toSectionsFromTemplatePage(
  page: TemplateDetail["pages"][number] | undefined
): PageSection[] {
  if (!page) return [];
  return page.sections.map((section, index) => ({
    id: `tpl-fallback-${index}`,
    type: section.type as SectionType,
    order: section.order,
    data: section.data,
    settings: section.settings,
  }));
}

/** Build theme card preview payload from GET /templates/:id (no workspace preview route). */
export function templateDetailToThemePreview(
  template: TemplateDetail,
  businessProfile: WorkspaceBusinessProfile = {}
): TemplateThemePreviewData {
  const home =
    template.pages.find((p) => p.slug === "home") ??
    template.pages.find((p) => p.pageType === "HOME") ??
    template.pages[0];

  const applied = Boolean(businessProfile.businessName?.trim());

  return {
    template: {
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description,
    },
    theme: template.theme as WebsiteTheme,
    businessProfileApplied: applied,
    businessProfile,
    page: {
      name: home?.name ?? "Home",
      slug: home?.slug ?? "home",
      pageType: home?.pageType ?? "HOME",
      seo: { title: null, metaDescription: null, socialImage: null },
      sections: toSectionsFromTemplatePage(home),
    },
  };
}
