"use client";

import { useEffect, useMemo, useState } from "react";
import { ScaledWebsitePreview } from "@/components/dashboard/ScaledWebsitePreview";
import { mergeWebsiteTheme } from "@/components/editor/sections/sectionStyles";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import * as previewApi from "@/services/preview.api";
import * as templatesApi from "@/services/templates.api";
import type { TemplateThemePreviewData } from "@/types/preview";
import type { PageSection, SectionType } from "@/types/page";
import type { TemplateDetail } from "@/types/template";
import type { WebsiteTheme } from "@/types/website";

function toSectionsFromTemplate(
  page: TemplateDetail["pages"][number] | undefined
): PageSection[] {
  if (!page) return [];
  return page.sections.map((section, index) => ({
    id: `tpl-card-${index}`,
    type: section.type as SectionType,
    order: section.order,
    data: section.data,
    settings: section.settings,
  }));
}

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

    const load = currentWorkspace
      ? previewApi.getTemplateThemePreview(currentWorkspace.id, templateId)
      : templatesApi.getTemplate(templateId).then((res) => {
          const t = res.data;
          const home =
            t.pages.find((p) => p.slug === "home") ?? t.pages[0];
          const fallback: TemplateThemePreviewData = {
            template: {
              id: t.id,
              name: t.name,
              category: t.category,
              description: t.description,
            },
            theme: t.theme as WebsiteTheme,
            businessProfileApplied: false,
            businessProfile: {},
            page: {
              name: home?.name ?? "Home",
              slug: home?.slug ?? "home",
              pageType: home?.pageType ?? "HOME",
              seo: { title: null, metaDescription: null, socialImage: null },
              sections: toSectionsFromTemplate(home),
            },
          };
          return { data: fallback };
        });

    void load
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
