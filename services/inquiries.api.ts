import { apiRequest } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/types/api";

export type SubmitInquiryPayload = {
  name: string;
  email: string;
  message: string;
  websiteId?: string;
};

export async function submitPublicWebsiteInquiry(
  publicId: string,
  payload: SubmitInquiryPayload
): Promise<ApiSuccessResponse<{ sent: boolean }>> {
  return apiRequest<ApiSuccessResponse<{ sent: boolean }>>(
    `/public/websites/${encodeURIComponent(publicId)}/inquiries`,
    {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        message: payload.message,
      }),
    }
  );
}

export async function submitWorkspaceInquiry(
  workspaceId: string,
  payload: SubmitInquiryPayload
): Promise<ApiSuccessResponse<{ sent: boolean }>> {
  return apiRequest<ApiSuccessResponse<{ sent: boolean }>>(
    `/workspaces/${encodeURIComponent(workspaceId)}/inquiries`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}
