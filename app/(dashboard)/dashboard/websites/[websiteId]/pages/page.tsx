"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { confirmAction } from "@/lib/confirm";
import { notify, notifyApiError } from "@/lib/notify";
import * as pagesApi from "@/services/pages.api";
import type { Page } from "@/types/page";

export default function WebsitePagesListPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
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
      setPages(res.data.pages);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to load pages"
      );
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, websiteId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(page: Page) {
    if (!currentWorkspace) return;
    if (
      !(await confirmAction({
        title: "Delete page?",
        message: `Delete page "${page.name}"? This cannot be undone.`,
        confirmLabel: "Delete",
        tone: "danger",
      }))
    ) {
      return;
    }
    try {
      await pagesApi.deletePage(currentWorkspace.id, websiteId, page.id);
      notify.success(`Deleted "${page.name}"`);
      await load();
    } catch (err) {
      notifyApiError(err, "Delete failed");
    }
  }

  return (
    <WorkspaceRequired>
      <Link
        href={`/dashboard/websites/${websiteId}`}
        className="mb-4 inline-block text-sm text-muted hover:text-brand"
      >
        ← Website
      </Link>
      <DashboardPageHeader
        title="Pages"
        description="Content pages for this website"
        actions={
          <Link
            href={`/dashboard/websites/${websiteId}/pages/new`}
            className="btn-primary rounded-lg px-4 py-2 text-sm"
          >
            Add page
          </Link>
        }
      />

      {error ? (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      {loading ? (
        <div className="dashboard-panel p-8 text-sm text-muted">Loading…</div>
      ) : pages.length === 0 ? (
        <div className="dashboard-panel p-10 text-center">
          <p className="text-muted">No pages yet.</p>
          <Link
            href={`/dashboard/websites/${websiteId}/pages/new`}
            className="btn-primary mt-4 inline-flex rounded-lg px-4 py-2 text-sm"
          >
            Create your first page
          </Link>
        </div>
      ) : (
        <div className="dashboard-panel overflow-x-auto">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Slug</th>
                <th>Sections</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td>
                    <Link
                      href={`/dashboard/websites/${websiteId}/editor/${page.id}`}
                      className="font-medium hover:text-brand"
                    >
                      {page.name}
                    </Link>
                  </td>
                  <td className="text-muted">{page.pageType}</td>
                  <td className="text-muted">{page.slug}</td>
                  <td className="text-muted">{page.sections.length}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/websites/${websiteId}/editor/${page.id}`}
                        className="btn-primary rounded-md px-2.5 py-1.5 text-xs"
                      >
                        Open builder
                      </Link>
                      <Link
                        href={`/dashboard/websites/${websiteId}/preview?slug=${encodeURIComponent(page.slug)}`}
                        className="btn-secondary rounded-md px-2.5 py-1.5 text-xs"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/dashboard/websites/${websiteId}/pages/${page.id}`}
                        className="btn-secondary rounded-md px-2.5 py-1.5 text-xs"
                      >
                        Settings
                      </Link>
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-md px-2.5 py-1.5 text-xs text-red-600"
                        onClick={() => void handleDelete(page)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </WorkspaceRequired>
  );
}
