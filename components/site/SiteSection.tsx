"use client";

import { SectionInlineEditProvider } from "@/components/editor/inline/SectionInlineEditContext";
import {
  normalizeWebsiteTheme,
  resolveSectionStyle,
  themeCssVars,
} from "@/components/editor/sections/sectionStyles";
import { sectionViewRegistry } from "@/components/editor/sections/registry";
import type { ContactInquiryTarget } from "@/types/inquiry";
import type { SectionStyleSettings } from "@/types/editor";
import type { PageSection } from "@/types/page";
import type { WebsiteTheme } from "@/types/website";

export function SiteSection({
  section,
  theme,
  pageSections = [],
  inquiryTarget,
}: {
  section: PageSection;
  theme: WebsiteTheme;
  pageSections?: PageSection[];
  inquiryTarget?: ContactInquiryTarget | null;
}) {
  const View = sectionViewRegistry[section.type];
  if (!View) {
    return (
      <div className="p-4 text-sm text-red-600">Unknown section: {section.type}</div>
    );
  }
  const normalizedTheme = normalizeWebsiteTheme(theme);
  const style = resolveSectionStyle(section);
  const themeVars = themeCssVars(normalizedTheme);
  return (
    <SectionInlineEditProvider
      active={false}
      showCanvasChrome={false}
      data={section.data}
      settings={(section.settings ?? {}) as SectionStyleSettings}
      themeTextFallback={normalizedTheme.colors?.text ?? "#1a3a4a"}
      onChange={() => {}}
    >
      <View
        section={section}
        style={style}
        themeVars={themeVars}
        pageSections={pageSections}
        inquiryTarget={inquiryTarget}
      />
    </SectionInlineEditProvider>
  );
}
