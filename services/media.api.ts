import { ApiClientError } from "@/lib/api-client";
import { isPublicTenantHost } from "@/lib/public-tenant-host";
import { getApiBaseUrl } from "@/services/api";
import type {
  MediaDeleteResponse,
  MediaListResponse,
  MediaResponse,
} from "@/types/media";
import type { ApiErrorResponse } from "@/types/api";

function base(workspaceId: string) {
  return `/workspaces/${workspaceId}/media`;
}

async function parseResponse<T>(response: Response): Promise<T> {
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

export async function listMedia(
  workspaceId: string,
  limit?: number
): Promise<MediaListResponse> {
  const q = limit ? `?limit=${limit}` : "";
  const url = `${getApiBaseUrl()}${base(workspaceId)}${q}`;
  const response = await fetch(url, { credentials: "include" });
  return parseResponse<MediaListResponse>(response);
}

export async function getMedia(
  workspaceId: string,
  mediaId: string
): Promise<MediaResponse> {
  const url = `${getApiBaseUrl()}${base(workspaceId)}/${mediaId}`;
  const response = await fetch(url, { credentials: "include" });
  return parseResponse<MediaResponse>(response);
}

export async function uploadMedia(
  workspaceId: string,
  file: File
): Promise<MediaResponse> {
  const form = new FormData();
  form.append("file", file);
  const url = `${getApiBaseUrl()}${base(workspaceId)}`;
  const response = await fetch(url, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  return parseResponse<MediaResponse>(response);
}

export async function replaceMedia(
  workspaceId: string,
  mediaId: string,
  file: File
): Promise<MediaResponse> {
  const form = new FormData();
  form.append("file", file);
  const url = `${getApiBaseUrl()}${base(workspaceId)}/${mediaId}`;
  const response = await fetch(url, {
    method: "PATCH",
    body: form,
    credentials: "include",
  });
  return parseResponse<MediaResponse>(response);
}

export async function deleteMedia(
  workspaceId: string,
  mediaId: string
): Promise<MediaDeleteResponse> {
  const url = `${getApiBaseUrl()}${base(workspaceId)}/${mediaId}`;
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return parseResponse<MediaDeleteResponse>(response);
}

const WORKSPACE_MEDIA_CONTENT =
  /\/workspaces\/[^/]+\/media\/([^/]+)\/content\/?$/;

function rewriteToPublicMediaUrl(resolved: string): string {
  const match = resolved.match(WORKSPACE_MEDIA_CONTENT);
  if (!match) return resolved;
  const mediaId = match[1];
  return `${getApiBaseUrl().replace(/\/$/, "")}/public/media/${mediaId}/content`;
}

/** Resolve API-relative url for img src (same-origin via Next rewrite). */
export function mediaUrlForDisplay(
  url: string,
  options?: { publicSite?: boolean }
): string {
  let resolved: string;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    resolved = url;
  } else if (url.startsWith("/")) {
    resolved = url;
  } else {
    resolved = `${getApiBaseUrl().replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  }

  const usePublic =
    options?.publicSite ?? isPublicTenantHost();
  if (usePublic) {
    return rewriteToPublicMediaUrl(resolved);
  }
  return resolved;
}
