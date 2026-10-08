"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { notify, notifyApiError } from "@/lib/notify";

export function WorkspaceSettingsPanel() {
  const {
    currentWorkspace,
    loading: wsLoading,
    updateWorkspaceName,
    createWorkspace,
    workspaces,
  } = useWorkspace();
  const [name, setName] = useState("");
  const [createName, setCreateName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      setName(currentWorkspace.name);
    }
  }, [currentWorkspace]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!currentWorkspace) return;
    setSubmitting(true);
    try {
      await updateWorkspaceName(currentWorkspace.id, name.trim());
      notify.success("Workspace name updated.");
    } catch (err) {
      notifyApiError(err, "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setSubmitting(true);
    try {
      await createWorkspace(createName.trim());
      setCreateName("");
      notify.success("Workspace created.");
    } catch (err) {
      notifyApiError(err, "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (wsLoading) {
    return <p className="text-sm text-muted">Loading workspace…</p>;
  }

  return (
    <div className="max-w-lg">
      <DashboardPageHeader
        title="Workspace"
        description="Manage your active workspace. Slug is used in URLs and cannot be changed here yet."
      />

      {workspaces.length === 0 ? (
        <div className="dashboard-panel p-6">
          <h2 className="text-lg font-semibold">Create your first workspace</h2>
          <p className="mt-2 text-sm text-muted">
            Websites and media are scoped to a workspace.
          </p>
          <form onSubmit={(e) => void handleCreate(e)} className="mt-4 space-y-4">
            <div>
              <FieldLabel htmlFor="create-name">Workspace name</FieldLabel>
              <Input
                id="create-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="My Business"
                required
              />
            </div>
            <Button type="submit" disabled={submitting}>
              Create workspace
            </Button>
          </form>
        </div>
      ) : currentWorkspace ? (
        <form
          onSubmit={(e) => void handleSave(e)}
          className="dashboard-panel space-y-5 p-6"
        >
          <div>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input
              id="slug"
              value={currentWorkspace.slug}
              readOnly
              className="bg-card/50 text-muted"
            />
          </div>
          <div>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={submitting}>
            Save changes
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted">Select a workspace from the header.</p>
      )}
    </div>
  );
}
