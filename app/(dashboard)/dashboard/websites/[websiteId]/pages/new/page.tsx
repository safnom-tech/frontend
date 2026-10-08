"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as pagesApi from "@/services/pages.api";
import type { PageType } from "@/types/page";

const PAGE_TYPES: PageType[] = [
  "HOME",
  "ABOUT",
  "SERVICES",
  "CONTACT",
  "CUSTOM",
];

export default function NewPagePage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [pageType, setPageType] = useState<PageType>("CUSTOM");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentWorkspace) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await pagesApi.createPage(currentWorkspace.id, websiteId, {
        name: name.trim(),
        slug: slug.trim() || undefined,
        pageType,
      });
      router.push(
        `/dashboard/websites/${websiteId}/editor/${res.data.id}`
      );
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Could not create page"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WorkspaceRequired>
      <div className="max-w-lg">
        <Link
          href={`/dashboard/websites/${websiteId}/pages`}
          className="mb-4 inline-block text-sm text-muted hover:text-brand"
        >
          ← Pages
        </Link>
        <DashboardPageHeader title="New page" />
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="dashboard-panel space-y-4 p-6"
        >
          {error ? <Alert tone="error">{error}</Alert> : null}
          <div>
            <FieldLabel htmlFor="page-name">Name</FieldLabel>
            <Input
              id="page-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="page-slug">Slug (optional)</FieldLabel>
            <Input
              id="page-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated from name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Page type</label>
            <select
              className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
              value={pageType}
              onChange={(e) => setPageType(e.target.value as PageType)}
            >
              {PAGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Creating…" : "Create page"}
          </Button>
        </form>
      </div>
    </WorkspaceRequired>
  );
}
