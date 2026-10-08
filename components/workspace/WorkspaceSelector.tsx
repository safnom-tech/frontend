"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";

type WorkspaceSelectorProps = {
  /** header = marketing top bar; sidebar = full-width in dashboard nav */
  variant?: "header" | "sidebar";
};

export function WorkspaceSelector({ variant = "header" }: WorkspaceSelectorProps) {
  const {
    workspaces,
    currentWorkspace,
    loading,
    selectWorkspace,
    createWorkspace,
  } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSidebar = variant === "sidebar";

  async function handleSelect(workspaceId: string) {
    setBusy(true);
    setError(null);
    try {
      await selectWorkspace(workspaceId);
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Could not switch workspace"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createWorkspace(newName.trim());
      setNewName("");
      setCreating(false);
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Could not create workspace"
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading && workspaces.length === 0) {
    return (
      <span
        className={`text-xs text-muted ${isSidebar ? "block px-2 py-2" : "hidden lg:inline"}`}
      >
        Workspaces…
      </span>
    );
  }

  const triggerClass = isSidebar
    ? "flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--dash-sidebar-border)] bg-[var(--dash-nav-hover)] px-3 py-2.5 text-left text-sm font-medium"
    : "btn-secondary max-w-[12rem] truncate rounded-lg px-3 py-2 text-xs font-medium";

  const wrapperClass = isSidebar
    ? "relative w-full"
    : "relative hidden lg:block";

  const panelClass = isSidebar
    ? "absolute bottom-full left-0 z-50 mb-2 w-full min-w-[14rem] rounded-xl border border-card-border bg-card p-2 shadow-lg"
    : "absolute right-0 z-50 mt-2 w-64 rounded-xl border border-card-border bg-card p-2 shadow-lg";

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">
          {currentWorkspace?.name ?? "Select workspace"}
        </span>
        <span className="shrink-0 text-xs text-muted" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className={panelClass}>
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Your workspaces
          </p>
          <ul className="max-h-48 overflow-y-auto" role="listbox">
            {workspaces.map((ws) => (
              <li key={ws.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={currentWorkspace?.id === ws.id}
                  disabled={busy}
                  onClick={() => void handleSelect(ws.id)}
                  className={`w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-brand/10 ${
                    currentWorkspace?.id === ws.id ? "bg-brand/10 font-medium" : ""
                  }`}
                >
                  {ws.name}
                </button>
              </li>
            ))}
          </ul>
          {creating ? (
            <form
              onSubmit={(e) => void handleCreate(e)}
              className="mt-2 space-y-2 border-t border-card-border pt-2"
            >
              <input
                className="input-field text-sm"
                placeholder="Workspace name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary flex-1 rounded-lg py-2 text-xs"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="btn-secondary rounded-lg px-3 py-2 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-2 w-full rounded-lg border border-dashed border-card-border py-2 text-xs font-medium text-brand hover:bg-brand/5"
            >
              + Create workspace
            </button>
          )}
          {currentWorkspace ? (
            <Link
              href="/dashboard/workspace"
              className="mt-2 block rounded-lg px-2 py-2 text-center text-xs font-medium text-muted hover:text-brand"
              onClick={() => setOpen(false)}
            >
              Workspace settings
            </Link>
          ) : null}
          {error ? (
            <p className="mt-2 px-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
