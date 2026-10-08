"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WorkspaceSelector } from "@/components/workspace/WorkspaceSelector";
import { useAuth } from "@/contexts/AuthContext";

export function SiteHeaderActions() {
  const { user, loading } = useAuth();

  return (
    <div className="flex items-center gap-2 text-sm sm:gap-3">
      <ThemeToggle className="hidden sm:inline-flex" />
      {!loading && user ? (
        <>
          <WorkspaceSelector />
          <Link
            href="/dashboard"
            className="btn-primary rounded-xl px-3 py-2 text-sm sm:px-4 sm:py-2.5"
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="btn-secondary hidden rounded-xl px-3 py-2 text-sm sm:inline-flex sm:px-4 sm:py-2.5"
          >
            Profile
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="btn-secondary rounded-xl px-3 py-2 text-sm sm:px-4 sm:py-2.5"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn-primary rounded-xl px-3 py-2 text-sm sm:px-4 sm:py-2.5"
          >
            Start free
          </Link>
        </>
      )}
    </div>
  );
}
