"use client";

import {
  followsLogisticsHero,
  SERVICE_CARDS_OVER_HERO_WRAPPER_CLASS,
} from "@/components/editor/sections/sectionLayout";
import {
  normalizeWebsiteTheme,
  themeCssVars,
} from "@/components/editor/sections/sectionStyles";
import { SectionReveal } from "@/components/site/SectionReveal";
import { SiteSection } from "@/components/site/SiteSection";
import type { ContactInquiryTarget } from "@/types/inquiry";
import type { PageSection } from "@/types/page";
import type { WebsiteTheme } from "@/types/website";

function sortSections(sections?: PageSection[] | null): PageSection[] {
  return [...(sections ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function WebsiteRenderer({
  theme,
  sections,
  className = "",
  emptyMessage = "This page has no content yet.",
  /** Step-by-step: first section shows immediately, later sections reveal on scroll. */
  revealOnScroll = false,
  inquiryTarget,
}: {
  theme: WebsiteTheme;
  sections: PageSection[];
  className?: string;
  emptyMessage?: string;
  revealOnScroll?: boolean;
  inquiryTarget?: ContactInquiryTarget | null;
}) {
  const sorted = sortSections(sections);
  const liveTheme = normalizeWebsiteTheme(theme);

  return (
    <div
      className={`@container/site min-h-0 w-full max-w-full overflow-x-hidden scroll-smooth ${className}`}
      style={{
        ...themeCssVars(liveTheme),
        background: "var(--editor-bg)",
        color: "var(--editor-text)",
      }}
    >
      {sorted.length === 0 ? (
        <div className="flex min-h-[min(100dvh-8rem,640px)] flex-col items-center justify-center p-8 text-center">
          <p className="text-lg font-medium">Empty page</p>
          <p className="mt-2 max-w-md text-sm text-muted">{emptyMessage}</p>
        </div>
      ) : (
        sorted.map((section, index) => (
          <SectionReveal
            key={section.id}
            index={index}
            enabled={revealOnScroll}
            className={
              followsLogisticsHero(sorted, index)
                ? SERVICE_CARDS_OVER_HERO_WRAPPER_CLASS
                : ""
            }
          >
            <SiteSection
              section={section}
              theme={liveTheme}
              pageSections={sorted}
              inquiryTarget={inquiryTarget}
            />
          </SectionReveal>
        ))
      )}
    </div>
  );
}
