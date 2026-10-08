import type { ApiSuccessResponse } from "@/types/api";

export type WebsiteStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export interface WebsiteTheme {
  colors?: Record<string, string>;
  typography?: Record<string, string>;
  buttons?: Record<string, string>;
}

export interface Website {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  slug: string;
  publicId: string;
  subscriptionId: string;
  status: WebsiteStatus;
  subdomain: string | null;
  publishedAt: string | null;
  publishedVersion: number;
  hasUnpublishedChanges: boolean;
  theme: WebsiteTheme;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type WebsitesListResponse = ApiSuccessResponse<{
  websites: Website[];
}>;

export type WebsiteResponse = ApiSuccessResponse<Website>;
