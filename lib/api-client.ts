import type { ApiErrorResponse } from "@/types/api";
import { getApiBaseUrl } from "@/services/api";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const body = (await response.json()) as T | ApiErrorResponse;

  if (!response.ok) {
    const err = body as ApiErrorResponse;
    throw new ApiClientError(
      err.message || `Request failed (${response.status})`,
      response.status,
      err.error?.code
    );
  }

  return body as T;
}
