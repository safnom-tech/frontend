import { getApiBaseUrl } from "@/lib/api-base-url";
import type { ApiErrorResponse, HealthResponse } from "@/types/api";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T;
  return body;
}

export async function getHealth(): Promise<HealthResponse> {
  const url = `${getApiBaseUrl()}/health`;
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await parseJson<ApiErrorResponse>(response);
    throw new Error(errorBody.message || `Health check failed (${response.status})`);
  }

  return parseJson<HealthResponse>(response);
}

export { getApiBaseUrl };
