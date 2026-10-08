"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as pagesApi from "@/services/pages.api";
import type { Page } from "@/types/page";

export default function EditorPagePicker() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const res = await pagesApi.listPages(currentWorkspace.id, websiteId);
      const list = res.data.pages;
      if (list.length === 1) {
        router.replace(
          `/dashboard/websites/${websiteId}/editor/${list[0].id}`
        );
        return;
      }
      setPages(list);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to load pages"
      );
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, websiteId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-card-border bg-card px-4">
        <Link
          href={`/dashboard/websites/${websiteId}`}
          className="text-xs text-muted hover:text-brand"
        >
          ← Website
        </Link>
        <h1 className="text-sm font-semibold">Page builder</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-lg">
          {error ? (
            <Alert tone="error">{error}</Alert>
          ) : loading ? (
            <p className="text-sm text-muted">Loading pages…</p>
          ) : pages.length === 0 ? (
            <div className="rounded-xl border border-card-border bg-card p-8 text-center">
              <p className="font-medium">Create your first page</p>
              <p className="mt-2 text-sm text-muted">
                Each page is built from simple blocks — intro, text, contact, and more.
              </p>
              <Link
                href={`/dashboard/websites/${websiteId}/pages/new`}
                className="btn-primary mt-4 inline-block rounded-lg px-4 py-2 text-sm"
              >
                Create page
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {pages.map((page) => (
                <li key={page.id}>
                  <Link
                    href={`/dashboard/websites/${websiteId}/editor/${page.id}`}
                    className="flex items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3 hover:border-brand/40"
                  >
                    <span>
                      <span className="font-medium">{page.name}</span>
                      <span className="ml-2 text-xs text-muted">{page.slug}</span>
                    </span>
                    <span className="text-xs text-brand">Open builder →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {!loading && pages.length > 0 ? (
            <div className="mt-6">
              <Link href={`/dashboard/websites/${websiteId}/pages/new`}>
                <Button type="button" variant="secondary" className="rounded-lg text-sm">
                  Add page
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
