"use client";

import Link from "next/link";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function WorkspaceRequired({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentWorkspace, loading, workspaces } = useWorkspace();

  if (loading) {
    return <p className="text-sm text-muted">Loading workspace…</p>;
  }

  if (!currentWorkspace) {
    return (
      <div className="dashboard-panel max-w-lg p-8">
        <h2 className="text-lg font-semibold">Select or create a workspace</h2>
        <p className="mt-2 text-sm text-muted">
          Websites belong to a workspace.{" "}
          {workspaces.length === 0
            ? "Create one to get started."
            : "Pick one from the header menu."}
        </p>
        <Link
          href="/dashboard/workspace"
          className="btn-primary mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm"
        >
          Set up workspace
        </Link>
      </div>
    );
  }

  return children;
}
