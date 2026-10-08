import { apiRequest } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/types/api";
import type { WebsiteStatus } from "@/types/website";

export interface PublishingState {
  websiteId: string;
  status: WebsiteStatus;
  subdomain: string | null;
  platformDomain: string | null;
  publishedAt: string | null;
  publishedVersion: number;
  hasUnpublishedChanges: boolean;
  publicUrl: string | null;
}

type PublishingStateResponse = ApiSuccessResponse<PublishingState>;

function base(workspaceId: string, websiteId: string) {
  return `/workspaces/${workspaceId}/websites/${websiteId}`;
}

export async function getPublishingState(
  workspaceId: string,
  websiteId: string
): Promise<PublishingStateResponse> {
  return apiRequest<PublishingStateResponse>(
    `${base(workspaceId, websiteId)}/publishing`
  );
}

export async function updateSubdomain(
  workspaceId: string,
  websiteId: string,
  subdomain: string
): Promise<PublishingStateResponse> {
  return apiRequest<PublishingStateResponse>(
    `${base(workspaceId, websiteId)}/publishing`,
    {
      method: "PATCH",
      body: JSON.stringify({ subdomain }),
    }
  );
}

export async function publishWebsite(
  workspaceId: string,
  websiteId: string,
  subdomain?: string
): Promise<PublishingStateResponse> {
  return apiRequest<PublishingStateResponse>(
    `${base(workspaceId, websiteId)}/publish`,
    {
      method: "POST",
      body: JSON.stringify(subdomain ? { subdomain } : {}),
    }
  );
}

export async function unpublishWebsite(
  workspaceId: string,
  websiteId: string
): Promise<PublishingStateResponse> {
  return apiRequest<PublishingStateResponse>(
    `${base(workspaceId, websiteId)}/unpublish`,
    { method: "POST", body: "{}" }
  );
}
