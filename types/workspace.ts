import type { ApiSuccessResponse } from "@/types/api";
import type { WorkspaceBusinessProfile } from "@/types/business-profile";

export type WorkspaceMemberRole = "OWNER" | "MEMBER";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  businessProfile: WorkspaceBusinessProfile;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceMemberRole;
}

export type WorkspacesListResponse = ApiSuccessResponse<{
  workspaces: WorkspaceWithRole[];
}>;

export type WorkspaceResponse = ApiSuccessResponse<Workspace | WorkspaceWithRole>;

export type CurrentWorkspaceResponse = ApiSuccessResponse<{
  workspace: Workspace | null;
}>;
