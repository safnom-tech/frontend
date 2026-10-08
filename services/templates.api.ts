import { apiRequest } from "@/lib/api-client";
import type {
  TemplateResponse,
  TemplatesListResponse,
} from "@/types/template";

export async function listTemplates(options?: {
  limit?: number;
  offset?: number;
}): Promise<TemplatesListResponse> {
  const params = new URLSearchParams();
  if (options?.limit !== undefined) {
    params.set("limit", String(options.limit));
  }
  if (options?.offset !== undefined) {
    params.set("offset", String(options.offset));
  }
  const qs = params.toString();
  return apiRequest<TemplatesListResponse>(
    `/templates${qs ? `?${qs}` : ""}`
  );
}

export async function getTemplate(
  templateId: string
): Promise<TemplateResponse> {
  return apiRequest<TemplateResponse>(`/templates/${templateId}`);
}
