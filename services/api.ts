import type { ApiErrorResponse, HealthResponse } from "@/types/api";

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    return configured ?? "/api/v1";
  }

  // Server Components: Node fetch cannot use `/api/v1` on tenant hosts (e.g. shop.safnom.site).
  const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
  if (backend) {
    return `${backend}/api/v1`;
  }
  if (configured?.startsWith("http")) {
    return configured;
  }
  return "http://localhost:8080/api/v1";
}

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
