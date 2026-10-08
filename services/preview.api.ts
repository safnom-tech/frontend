import { apiRequest } from "@/lib/api-client";
import type {
  TemplateThemePreviewResponse,
  WebsitePreviewResponse,
} from "@/types/preview";

export async function getWebsitePreview(
  workspaceId: string,
  websiteId: string,
  slug?: string
): Promise<WebsitePreviewResponse> {
  const qs = slug ? `?slug=${encodeURIComponent(slug)}` : "";
  return apiRequest<WebsitePreviewResponse>(
    `/workspaces/${workspaceId}/websites/${websiteId}/preview${qs}`
  );
}

export async function getTemplateThemePreview(
  workspaceId: string,
  templateId: string
): Promise<TemplateThemePreviewResponse> {
  return apiRequest<TemplateThemePreviewResponse>(
    `/workspaces/${workspaceId}/templates/${encodeURIComponent(templateId)}/preview`
  );
}
