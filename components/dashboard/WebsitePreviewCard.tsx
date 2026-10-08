"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ScaledWebsitePreview } from "@/components/dashboard/ScaledWebsitePreview";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { Button } from "@/components/ui/Button";
import { mergeWebsiteTheme } from "@/components/editor/sections/sectionStyles";
import * as previewApi from "@/services/preview.api";
import type { WebsitePreviewData } from "@/types/preview";
import type { Website } from "@/types/website";

/** Square card for an account website with live scaled page preview inside. */
export function WebsitePreviewCard({
  workspaceId,
  website,
  onDelete,
}: {
  workspaceId: string;
  website: Website;
  onDelete: () => void;
}) {
  const [preview, setPreview] = useState<WebsitePreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void previewApi
      .getWebsitePreview(workspaceId, website.id)
      .then((res) => {
        if (!cancelled) setPreview(res.data);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, website.id, website.updatedAt]);

  const theme = useMemo(
    () =>
      mergeWebsiteTheme(preview?.website.theme, website.theme),
    [preview?.website.theme, website.theme]
  );

  const sections = preview?.page.sections ?? [];

  return (
    <li className="dashboard-panel flex flex-col overflow-hidden">
      <Link
        href={`/dashboard/websites/${website.id}/preview`}
        className="relative block aspect-[4/3] overflow-hidden border-b border-card-border bg-white"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <span className="absolute right-2 top-2 z-20">
          <WebsiteStatusBadge status={website.status} />
        </span>

        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            Loading preview…
          </div>
        ) : preview && sections.length > 0 ? (
          <ScaledWebsitePreview
            theme={theme}
            sections={sections}
            className="absolute inset-0 h-full w-full"
            hovering={hovering}
            emptyMessage="No sections yet"
          />
        ) : (
          <div
            className="flex h-full flex-col justify-end p-4"
            style={{
              background: `linear-gradient(145deg, ${website.theme?.colors?.primary ?? "#3da6ad"}44, ${website.theme?.colors?.background ?? "#ffffff"})`,
            }}
          >
            <p className="text-sm font-semibold">{website.name}</p>
            <p className="text-[10px] text-muted">Preview unavailable</p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/55 via-black/20 to-transparent p-3 pt-10">
          <p className="truncate text-sm font-semibold text-white drop-shadow">
            {website.name}
          </p>
          <p className="font-mono text-[10px] text-white/80">
            {website.publicId || website.slug}
          </p>
        </div>
      </Link>

      <div className="flex flex-wrap gap-2 p-3">
        <Link
          href={`/dashboard/websites/${website.id}/editor`}
          className="btn-primary rounded-lg px-3 py-1.5 text-xs"
        >
          Open editor
        </Link>
        <Link
          href={`/dashboard/websites/${website.id}/preview`}
          className="btn-secondary rounded-lg px-3 py-1.5 text-xs"
        >
          Full preview
        </Link>
        <Button
          type="button"
          variant="secondary"
          className="rounded-lg px-3 py-1.5 text-xs text-red-600"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}
