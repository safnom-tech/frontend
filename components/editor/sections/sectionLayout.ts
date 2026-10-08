import type { PageSection } from "@/types/page";

export function sectionVariant(section: PageSection): string {
  const v = section.settings?.variant;
  return typeof v === "string" ? v : "default";
}

/** Freight service cards row overlapping a logistics hero (Ocean Crown layout). */
export function followsLogisticsHero(
  sections: PageSection[],
  index: number
): boolean {
  const section = sections[index];
  const prev = sections[index - 1];
  if (!section || !prev) return false;
  if (section.type !== "SERVICES" || sectionVariant(section) !== "serviceCards") {
    return false;
  }
  if (prev.type !== "HERO") return false;
  return sectionVariant(prev) === "logistics";
}

/** Service card row min height — keep in sync with SectionViews serviceCards cells. */
export const SERVICE_CARDS_ROW_PX = 148;

export const SERVICE_CARDS_OVER_HERO_WRAPPER_CLASS = "relative z-20";
