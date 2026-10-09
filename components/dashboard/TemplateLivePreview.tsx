"use client";

import { useEffect, useMemo, useState } from "react";
import { ScaledWebsitePreview } from "@/components/dashboard/ScaledWebsitePreview";
import { mergeWebsiteTheme } from "@/components/editor/sections/sectionStyles";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { loadTemplateThemePreview } from "@/lib/load-template-theme-preview";
import type { TemplateThemePreviewData } from "@/types/preview";
import type { WebsiteTheme } from "@/types/website";

/** Live scaled template render — hover slowly scrolls to reveal the full page. */
export function TemplateLivePreview({
  templateId,
  className = "",
  hovering: hoveringProp,
  themeOverride,
}: {
  templateId: string;
  className?: string;
  hovering?: boolean;
  themeOverride?: WebsiteTheme;
}) {
  const { currentWorkspace } = useWorkspace();
  const [preview, setPreview] = useState<TemplateThemePreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const profileKey = useMemo(
    () => JSON.stringify(currentWorkspace?.businessProfile ?? {}),
    [currentWorkspace?.businessProfile]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void loadTemplateThemePreview(
      currentWorkspace?.id,
      templateId,
      currentWorkspace?.businessProfile
    )
      .then((data) => {
        if (!cancelled) setPreview(data);
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
  }, [templateId, currentWorkspace?.id, profileKey]);

  const theme = mergeWebsiteTheme(
    preview?.theme ?? {},
    themeOverride
  );
  const sections = preview?.page.sections ?? [];

  if (loading) {
    return (
      <div
        className={`flex h-full items-center justify-center text-xs text-muted ${className}`}
      >
        Loading preview…
      </div>
    );
  }

  if (!preview) {
    return (
      <div
        className={`flex h-full items-center justify-center text-xs text-muted ${className}`}
      >
        Preview unavailable
      </div>
    );
  }

  return (
    <ScaledWebsitePreview
      theme={theme}
      sections={sections}
      className={className}
      hovering={hoveringProp}
      emptyMessage="No preview content"
    />
  );
}
