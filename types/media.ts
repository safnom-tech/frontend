import type { ApiSuccessResponse } from "@/types/api";

export interface Media {
  id: string;
  workspaceId: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export type MediaListResponse = ApiSuccessResponse<{ media: Media[] }>;
export type MediaResponse = ApiSuccessResponse<Media>;
export type MediaDeleteResponse = ApiSuccessResponse<{ id: string }>;
