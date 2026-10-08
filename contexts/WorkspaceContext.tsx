"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiClientError } from "@/lib/api-client";
import * as workspacesApi from "@/services/workspaces.api";
import { emptyBusinessProfile } from "@/types/business-profile";
import type { Workspace, WorkspaceWithRole } from "@/types/workspace";

function normalizeWorkspace(w: Workspace): Workspace {
  return {
    ...w,
    businessProfile: {
      ...emptyBusinessProfile(),
      ...w.businessProfile,
    },
  };
}

interface WorkspaceContextValue {
  workspaces: WorkspaceWithRole[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  error: string | null;
  refreshWorkspaces: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  updateWorkspaceName: (workspaceId: string, name: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [listRes, currentRes] = await Promise.all([
        workspacesApi.listWorkspaces(),
        workspacesApi.getCurrentWorkspace(),
      ]);
      setWorkspaces(
        listRes.data.workspaces.map((w) => ({
          ...normalizeWorkspace(w),
          role: w.role,
        }))
      );
      setCurrentWorkspace(
        currentRes.data.workspace
          ? normalizeWorkspace(currentRes.data.workspace)
          : null
      );
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to load workspaces";
      setError(message);
      setWorkspaces([]);
      setCurrentWorkspace(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshWorkspaces();
  }, [refreshWorkspaces]);

  const selectWorkspace = useCallback(
    async (workspaceId: string) => {
      const res = await workspacesApi.selectWorkspace(workspaceId);
      setCurrentWorkspace(normalizeWorkspace(res.data));
      await refreshWorkspaces();
    },
    [refreshWorkspaces]
  );

  const createWorkspace = useCallback(
    async (name: string) => {
      const res = await workspacesApi.createWorkspace({ name });
      await refreshWorkspaces();
      return res.data;
    },
    [refreshWorkspaces]
  );

  const updateWorkspaceName = useCallback(
    async (workspaceId: string, name: string) => {
      const res = await workspacesApi.updateWorkspace(workspaceId, { name });
      setCurrentWorkspace((prev) =>
        prev?.id === workspaceId ? normalizeWorkspace(res.data) : prev
      );
      await refreshWorkspaces();
    },
    [refreshWorkspaces]
  );

  const value = useMemo(
    () => ({
      workspaces,
      currentWorkspace,
      loading,
      error,
      refreshWorkspaces,
      selectWorkspace,
      createWorkspace,
      updateWorkspaceName,
    }),
    [
      workspaces,
      currentWorkspace,
      loading,
      error,
      refreshWorkspaces,
      selectWorkspace,
      createWorkspace,
      updateWorkspaceName,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
