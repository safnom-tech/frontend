import { apiRequest } from "@/lib/api-client";
import type {
  Website,
  WebsiteResponse,
  WebsitesListResponse,
  WebsiteTheme,
} from "@/types/website";

function base(workspaceId: string) {
  return `/workspaces/${workspaceId}/websites`;
}

export async function listWebsites(
  workspaceId: string
): Promise<WebsitesListResponse> {
  return apiRequest<WebsitesListResponse>(base(workspaceId));
}

export async function createWebsite(
  workspaceId: string,
  input: { name?: string; description?: string; templateId?: string }
): Promise<WebsiteResponse> {
  return apiRequest<WebsiteResponse>(base(workspaceId), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getWebsite(
  workspaceId: string,
  websiteId: string
): Promise<WebsiteResponse> {
  return apiRequest<WebsiteResponse>(`${base(workspaceId)}/${websiteId}`);
}

export async function updateWebsite(
  workspaceId: string,
  websiteId: string,
  input: {
    name?: string;
    description?: string | null;
    theme?: WebsiteTheme;
  }
): Promise<WebsiteResponse> {
  return apiRequest<WebsiteResponse>(`${base(workspaceId)}/${websiteId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteWebsite(
  workspaceId: string,
  websiteId: string
): Promise<{ success: true; message: string; data: null }> {
  return apiRequest(`${base(workspaceId)}/${websiteId}`, {
    method: "DELETE",
  });
}

export type { Website };
