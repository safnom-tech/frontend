import { apiRequest } from "@/lib/api-client";
import type {
  Page,
  PageSeo,
  PageResponse,
  PagesListResponse,
  PageStatus,
  PageType,
  SectionResponse,
  SectionType,
  SectionsReorderResponse,
} from "@/types/page";

function base(workspaceId: string, websiteId: string) {
  return `/workspaces/${workspaceId}/websites/${websiteId}/pages`;
}

export async function listPages(
  workspaceId: string,
  websiteId: string
): Promise<PagesListResponse> {
  return apiRequest<PagesListResponse>(base(workspaceId, websiteId));
}

export async function createPage(
  workspaceId: string,
  websiteId: string,
  input: {
    name: string;
    slug?: string;
    pageType?: PageType;
  }
): Promise<PageResponse> {
  return apiRequest<PageResponse>(base(workspaceId, websiteId), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPage(
  workspaceId: string,
  websiteId: string,
  pageId: string
): Promise<PageResponse> {
  return apiRequest<PageResponse>(
    `${base(workspaceId, websiteId)}/${pageId}`
  );
}

export async function updatePage(
  workspaceId: string,
  websiteId: string,
  pageId: string,
  input: {
    name?: string;
    slug?: string;
    pageType?: PageType;
    status?: PageStatus;
    seo?: Partial<PageSeo>;
  }
): Promise<PageResponse> {
  return apiRequest<PageResponse>(
    `${base(workspaceId, websiteId)}/${pageId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

export async function deletePage(
  workspaceId: string,
  websiteId: string,
  pageId: string
): Promise<{ success: true; message: string; data: null }> {
  return apiRequest(`${base(workspaceId, websiteId)}/${pageId}`, {
    method: "DELETE",
  });
}

export async function addSection(
  workspaceId: string,
  websiteId: string,
  pageId: string,
  input: {
    type: SectionType;
    order?: number;
    data?: Record<string, unknown>;
    settings?: Record<string, unknown>;
  }
): Promise<SectionResponse> {
  return apiRequest<SectionResponse>(
    `${base(workspaceId, websiteId)}/${pageId}/sections`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateSection(
  workspaceId: string,
  websiteId: string,
  pageId: string,
  sectionId: string,
  input: {
    type?: SectionType;
    order?: number;
    data?: Record<string, unknown>;
    settings?: Record<string, unknown>;
  }
): Promise<SectionResponse> {
  return apiRequest<SectionResponse>(
    `${base(workspaceId, websiteId)}/${pageId}/sections/${sectionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteSection(
  workspaceId: string,
  websiteId: string,
  pageId: string,
  sectionId: string
): Promise<{ success: true; message: string; data: null }> {
  return apiRequest(
    `${base(workspaceId, websiteId)}/${pageId}/sections/${sectionId}`,
    { method: "DELETE" }
  );
}

export async function duplicateSection(
  workspaceId: string,
  websiteId: string,
  pageId: string,
  sectionId: string
): Promise<SectionResponse> {
  return apiRequest<SectionResponse>(
    `${base(workspaceId, websiteId)}/${pageId}/sections/${sectionId}/duplicate`,
    { method: "POST" }
  );
}

export async function reorderSections(
  workspaceId: string,
  websiteId: string,
  pageId: string,
  sectionIds: string[]
): Promise<SectionsReorderResponse> {
  return apiRequest<SectionsReorderResponse>(
    `${base(workspaceId, websiteId)}/${pageId}/sections/reorder`,
    {
      method: "PATCH",
      body: JSON.stringify({ sectionIds }),
    }
  );
}

export type { Page, PageSection, SectionType } from "@/types/page";
