"use client";

import { ComposedNodeRenderer } from "@/components/editor/sections/composed/ComposedNodeRenderer";
import type { SectionViewProps } from "@/components/editor/sections/registry";
import { parseComposedSectionFromData } from "@/types/composed-section";

function sectionPadding(spacing?: string) {
  if (spacing === "compact") return "py-8 md:py-10";
  if (spacing === "large") return "py-14 md:py-20";
  return "py-10 md:py-14";
}

function sectionBackground(bg?: string) {
  if (bg === "muted") return "bg-[var(--site-muted-bg)]";
  if (bg === "primary") return "bg-[var(--site-primary)] text-white";
  if (bg === "dark") return "bg-[var(--site-dark)] text-[var(--site-on-dark)]";
  if (bg === "gradient") {
    return "bg-gradient-to-br from-[var(--site-primary)]/10 via-[var(--site-bg)] to-[var(--site-secondary)]/10";
  }
  return "bg-[var(--site-bg)]";
}

export function ComposedSectionView({ section, style }: SectionViewProps) {
  const composed = parseComposedSectionFromData(section.data);
  if (!composed) {
    return (
      <div style={style} className="px-4 py-10 text-sm text-muted">
        Custom section — regenerate with AI or edit manually.
      </div>
    );
  }

  const theme = composed.theme ?? {};
  const customBackground = Boolean(style?.backgroundColor);

  return (
    <section
      style={style}
      className={`${sectionPadding(theme.spacing)} ${
        customBackground ? "" : sectionBackground(theme.background)
      }`}
      data-composed-layout={composed.layout}
      data-composed-type={composed.semanticType}
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <ComposedNodeRenderer node={composed.root} nodePath={[]} />
      </div>
    </section>
  );
}
