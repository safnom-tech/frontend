import { apiRequest } from "@/lib/api-client";
import type { WorkspaceBusinessProfile } from "@/types/business-profile";
import type {
  CurrentWorkspaceResponse,
  Workspace,
  WorkspaceResponse,
  WorkspaceWithRole,
  WorkspacesListResponse,
} from "@/types/workspace";

export async function listWorkspaces(): Promise<WorkspacesListResponse> {
  return apiRequest<WorkspacesListResponse>("/workspaces");
}

export async function getCurrentWorkspace(): Promise<CurrentWorkspaceResponse> {
  return apiRequest<CurrentWorkspaceResponse>("/workspaces/current");
}

export async function createWorkspace(input: {
  name: string;
  slug?: string;
}): Promise<WorkspaceResponse> {
  return apiRequest<WorkspaceResponse>("/workspaces", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getWorkspace(
  workspaceId: string
): Promise<WorkspaceResponse> {
  return apiRequest<WorkspaceResponse>(`/workspaces/${workspaceId}`);
}

export async function updateWorkspace(
  workspaceId: string,
  input: { name?: string; businessProfile?: WorkspaceBusinessProfile }
): Promise<WorkspaceResponse> {
  return apiRequest<WorkspaceResponse>(`/workspaces/${workspaceId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function selectWorkspace(
  workspaceId: string
): Promise<WorkspaceResponse> {
  return apiRequest<WorkspaceResponse>(`/workspaces/${workspaceId}/select`, {
    method: "POST",
  });
}

export type { Workspace, WorkspaceWithRole };
