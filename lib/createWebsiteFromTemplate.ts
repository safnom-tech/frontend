import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import * as pagesApi from "@/services/pages.api";
import * as websitesApi from "@/services/websites.api";

/** Creates a site from a theme and opens the home page in the visual editor. */
export async function createWebsiteFromTemplateAndOpenEditor(
  workspaceId: string,
  templateId: string,
  router: AppRouterInstance
): Promise<string> {
  const res = await websitesApi.createWebsite(workspaceId, { templateId });
  const websiteId = res.data.id;
  try {
    const pagesRes = await pagesApi.listPages(workspaceId, websiteId);
    const home =
      pagesRes.data.pages.find((p) => p.slug === "home") ??
      pagesRes.data.pages[0];
    if (home) {
      router.push(`/dashboard/websites/${websiteId}/editor/${home.id}`);
      return websiteId;
    }
  } catch {
    // fall through
  }
  router.push(`/dashboard/websites/${websiteId}`);
  return websiteId;
}
