"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { notify, notifyApiError } from "@/lib/notify";
import * as userApi from "@/services/user.api";

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const { workspaces, currentWorkspace } = useWorkspace();
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?from=/profile");
    }
    if (user) {
      setName(user.name ?? "");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="page-mesh flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center p-8 text-muted">
          Loading profile…
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.updateMe({ name: name.trim() || undefined });
      await refreshUser();
      notify.success("Profile updated successfully.");
    } catch (err) {
      notifyApiError(err, "Update failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="page-mesh flex min-h-full flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            Account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
          <p className="text-sm text-muted">{user.email}</p>
        </header>

        {workspaces.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-sm">
            <p className="font-medium text-foreground">No workspace yet</p>
            <p className="mt-1 text-muted">
              Create a workspace to prepare for building sites in later steps.
            </p>
            <Link
              href="/dashboard/workspace"
              className="btn-primary mt-4 inline-flex rounded-xl px-4 py-2 text-sm"
            >
              Create workspace
            </Link>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 text-sm">
            <p className="text-muted">Current workspace</p>
            <p className="mt-1 font-semibold">
              {currentWorkspace?.name ?? "None selected"}
            </p>
            <Link
              href="/dashboard/workspace"
              className="mt-3 inline-block font-medium text-brand hover:underline"
            >
              Workspace settings →
            </Link>
          </div>
        )}

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="glass-card space-y-5 rounded-2xl p-8"
        >
          <div className="space-y-2">
            <FieldLabel htmlFor="displayName">Display name</FieldLabel>
            <Input
              id="displayName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How we should greet you"
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            href="/"
            className="font-medium text-brand dark:text-accent-soft hover:underline"
          >
            ← Home
          </Link>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
