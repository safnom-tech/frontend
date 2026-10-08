"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { confirmAction } from "@/lib/confirm";
import { notifyApiError } from "@/lib/notify";
import * as pagesApi from "@/services/pages.api";
import type { Page, PageSection, PageType, SectionType } from "@/types/page";

const PAGE_TYPES: PageType[] = [
  "HOME",
  "ABOUT",
  "SERVICES",
  "CONTACT",
  "CUSTOM",
];

const SECTION_TYPES: SectionType[] = [
  "HEADER",
  "HERO",
  "TEXT",
  "IMAGE",
  "SERVICES",
  "FEATURES",
  "GALLERY",
  "TESTIMONIALS",
  "PRICING",
  "FAQ",
  "CONTACT",
  "FOOTER",
];

export default function PageDetailPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const pageId = params.pageId as string;
  const { currentWorkspace } = useWorkspace();
  const [page, setPage] = useState<Page | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [pageType, setPageType] = useState<PageType>("CUSTOM");
  const [newSectionType, setNewSectionType] = useState<SectionType>("HERO");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const res = await pagesApi.getPage(
        currentWorkspace.id,
        websiteId,
        pageId
      );
      setPage(res.data);
      setName(res.data.name);
      setSlug(res.data.slug);
      setPageType(res.data.pageType);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to load page"
      );
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, websiteId, pageId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentWorkspace) return;
    setSaving(true);
    setError(null);
    try {
      const res = await pagesApi.updatePage(
        currentWorkspace.id,
        websiteId,
        pageId,
        { name: name.trim(), slug: slug.trim(), pageType }
      );
      setPage(res.data);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function onAddSection() {
    if (!currentWorkspace) return;
    setError(null);
    try {
      await pagesApi.addSection(currentWorkspace.id, websiteId, pageId, {
        type: newSectionType,
        data: {},
        settings: {},
      });
      await load();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Could not add section"
      );
    }
  }

  async function onDeleteSection(section: PageSection) {
    if (!currentWorkspace) return;
    if (
      !(await confirmAction({
        title: "Remove section?",
        message: `Remove the ${section.type} section from this page?`,
        confirmLabel: "Remove",
        tone: "danger",
      }))
    ) {
      return;
    }
    try {
      await pagesApi.deleteSection(
        currentWorkspace.id,
        websiteId,
        pageId,
        section.id
      );
      await load();
    } catch (err) {
      notifyApiError(err, "Delete failed");
    }
  }

  async function onDuplicateSection(sectionId: string) {
    if (!currentWorkspace) return;
    try {
      await pagesApi.duplicateSection(
        currentWorkspace.id,
        websiteId,
        pageId,
        sectionId
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Duplicate failed"
      );
    }
  }

  async function moveSection(index: number, direction: -1 | 1) {
    if (!currentWorkspace || !page) return;
    const sections = [...page.sections].sort((a, b) => a.order - b.order);
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const ids = sections.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await pagesApi.reorderSections(
        currentWorkspace.id,
        websiteId,
        pageId,
        ids
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Reorder failed"
      );
    }
  }

  const sortedSections = page
    ? [...page.sections].sort((a, b) => a.order - b.order)
    : [];

  return (
    <WorkspaceRequired>
      <div className="max-w-3xl">
        <Link
          href={`/dashboard/websites/${websiteId}/pages`}
          className="mb-4 inline-block text-sm text-muted hover:text-brand"
        >
          ← Pages
        </Link>

        {loading ? (
          <div className="dashboard-panel p-8 text-sm text-muted">Loading…</div>
        ) : !page ? (
          <Alert tone="error">{error ?? "Page not found"}</Alert>
        ) : (
          <>
            <DashboardPageHeader
              title={page.name}
              description={`/${page.slug}`}
              actions={
                <Link
                  href={`/dashboard/websites/${websiteId}/editor/${pageId}`}
                  className="btn-primary rounded-lg px-3 py-2 text-xs"
                >
                  Open builder
                </Link>
              }
            />

            {error ? (
              <div className="mb-4">
                <Alert tone="error">{error}</Alert>
              </div>
            ) : null}

            <p className="mb-4 text-sm text-muted">
              Use the visual builder to edit page content. This screen is for page settings and advanced section tools.
            </p>

            <form
              onSubmit={(e) => void onSave(e)}
              className="dashboard-panel mb-8 space-y-4 p-6"
            >
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
                <FieldLabel htmlFor="page-slug">Slug</FieldLabel>
                <Input
                  id="page-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
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
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save page"}
              </Button>
            </form>

            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-lg font-semibold">Sections</h2>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm"
                  value={newSectionType}
                  onChange={(e) =>
                    setNewSectionType(e.target.value as SectionType)
                  }
                >
                  {SECTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={() => void onAddSection()}>
                  Add section
                </Button>
              </div>
            </div>

            {sortedSections.length === 0 ? (
              <div className="dashboard-panel p-6 text-sm text-muted">
                No sections yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {sortedSections.map((section, index) => (
                  <li
                    key={section.id}
                    className="dashboard-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{section.type}</p>
                      <p className="text-xs text-muted">
                        Order {section.order} · ID {section.id.slice(-6)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-md px-2 py-1 text-xs"
                        disabled={index === 0}
                        onClick={() => void moveSection(index, -1)}
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-md px-2 py-1 text-xs"
                        disabled={index === sortedSections.length - 1}
                        onClick={() => void moveSection(index, 1)}
                      >
                        Down
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-md px-2 py-1 text-xs"
                        onClick={() => void onDuplicateSection(section.id)}
                      >
                        Duplicate
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-md px-2 py-1 text-xs text-red-600"
                        onClick={() => void onDeleteSection(section)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </WorkspaceRequired>
  );
}
