import { ApiClientError } from "@/lib/api-client";
import { templateDetailToThemePreview } from "@/lib/template-preview-fallback";
import * as previewApi from "@/services/preview.api";
import * as templatesApi from "@/services/templates.api";
import type { WorkspaceBusinessProfile } from "@/types/business-profile";
import type { TemplateThemePreviewData } from "@/types/preview";

/**
 * Prefer workspace preview (business profile applied). Fall back to GET /templates/:id
 * when the API build is missing workspace preview routes (404 NOT_FOUND).
 */
export async function loadTemplateThemePreview(
  workspaceId: string | undefined,
  templateId: string,
  businessProfile: WorkspaceBusinessProfile = {}
): Promise<TemplateThemePreviewData> {
  if (workspaceId) {
    try {
      const res = await previewApi.getTemplateThemePreview(
        workspaceId,
        templateId
      );
      return res.data;
    } catch (err) {
      const missingRoute =
        err instanceof ApiClientError &&
        err.status === 404 &&
        err.code === "NOT_FOUND";
      if (!missingRoute) {
        throw err;
      }
    }
  }

  const res = await templatesApi.getTemplate(templateId);
  return templateDetailToThemePreview(res.data, businessProfile);
}
