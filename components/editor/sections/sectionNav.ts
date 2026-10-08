import type { PageSection } from "@/types/page";

export type SectionNavItem = {
  label: string;
  sub: string;
  href: string;
  sectionId: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

function variantOf(section: PageSection): string {
  return String(
    (section.settings as { variant?: string } | undefined)?.variant ?? "default"
  );
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** DOM id used for in-page scroll targets (matches SectionViews anchors). */
export function sectionAnchorId(section: PageSection): string | null {
  const variant = variantOf(section);
  switch (section.type) {
    case "HEADER":
      return null;
    case "HERO":
      return "home";
    case "SERVICES":
      if (variant === "darkServiceGrid") return "unmatched-services";
      return "services";
    case "FEATURES":
      if (variant === "whyChoose") return "corporate";
      if (variant === "innovation") return "about";
      return "features";
    case "GALLERY":
      if (variant === "productGrid") return "products";
      return "gallery";
    case "TESTIMONIALS":
      return "testimonials";
    case "CONTACT":
    case "FOOTER":
      return "contact";
    case "TEXT":
      return "text";
    case "IMAGE":
      return "image";
    case "PRICING":
      return "pricing";
    case "FAQ":
      return "faq";
    default:
      return null;
  }
}

function navMetaForSection(
  section: PageSection
): { label: string; sub: string } | null {
  const variant = variantOf(section);
  const heading = str(section.data.heading) || str(section.data.title);

  switch (section.type) {
    case "HEADER":
      return null;
    case "HERO":
      return { label: "Home", sub: "Main Page" };
    case "SERVICES":
      if (variant === "darkServiceGrid") {
        return {
          label: heading ? heading.split(/[.?]/)[0]!.slice(0, 22) : "Excellence",
          sub: "Services",
        };
      }
      return { label: "We Offer", sub: "Services" };
    case "FEATURES":
      if (variant === "whyChoose") {
        return { label: "Corporate", sub: "About Us" };
      }
      if (variant === "innovation") {
        return { label: "Partners", sub: "Network" };
      }
      return { label: heading || "Features", sub: "Highlights" };
    case "FAQ":
      return { label: "FAQ", sub: "Answers" };
    case "GALLERY":
      return { label: "Gallery", sub: "Photos" };
    case "TESTIMONIALS":
      return { label: "Stories", sub: "Clients" };
    case "CONTACT":
      return { label: "Contact", sub: "Reach Out" };
    case "FOOTER":
      return { label: "Contact Us", sub: "Reach Out" };
    case "TEXT":
      return { label: heading || "Text", sub: "" };
    case "IMAGE":
      return { label: heading || "Image", sub: "" };
    case "PRICING":
      return { label: "Pricing", sub: "Plans" };
    default:
      return null;
  }
}

/**
 * Header menu built only from sections present on the page (order preserved).
 * Duplicate anchors keep the first occurrence.
 */
export function navItemsFromSections(sections: PageSection[]): SectionNavItem[] {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const seen = new Set<string>();
  const items: SectionNavItem[] = [];

  for (const section of sorted) {
    const anchor = sectionAnchorId(section);
    const meta = navMetaForSection(section);
    if (!anchor || !meta) continue;
    if (seen.has(anchor)) continue;
    seen.add(anchor);
    items.push({
      label: meta.label,
      sub: meta.sub,
      href: `#${anchor}`,
      sectionId: section.id,
    });
  }

  return items;
}

/** True when the page has a scroll target for this hash (e.g. #track in footer). */
export function pageHasAnchor(
  sections: PageSection[],
  hash: string
): boolean {
  const id = hash.replace(/^#/, "").trim().toLowerCase();
  if (!id) return false;
  if (id === "quote") {
    return sections.some((s) => s.type === "HERO");
  }
  if (id === "track") {
    return sections.some(
      (s) => s.type === "FOOTER" && variantOf(s) === "logistics"
    );
  }
  if (id === "top") return true;
  return sections.some((s) => sectionAnchorId(s) === id);
}

function serviceItemLines(section: PageSection): string[] {
  const raw = section.data.items;
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x)).filter((s) => s.trim());
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function labelFromServiceLine(line: string): string {
  const [title] = line.split("|").map((s) => s.trim());
  return title || line.trim();
}

/** Services column: labels from SERVICES blocks, links to their on-page anchors. */
export function footerServiceLinksFromSections(
  sections: PageSection[]
): FooterLink[] {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const seen = new Set<string>();
  const links: FooterLink[] = [];

  for (const section of sorted) {
    if (section.type !== "SERVICES") continue;
    const anchor = sectionAnchorId(section);
    if (!anchor) continue;
    const href = `#${anchor}`;
    for (const line of serviceItemLines(section)) {
      const label = labelFromServiceLine(line);
      if (!label) continue;
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ label, href });
    }
  }

  return links;
}

/** Quicklinks column: in-page targets that exist (plus track / quote when available). */
export function footerQuickLinksFromSections(
  sections: PageSection[]
): FooterLink[] {
  const links: FooterLink[] = [];
  const seen = new Set<string>();

  function add(label: string, href: string) {
    const key = href.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ label, href });
  }

  if (pageHasAnchor(sections, "#track")) {
    add("Shipment Tracking", "#track");
  }
  if (pageHasAnchor(sections, "#quote")) {
    add("Get A Quote", "#quote");
  }

  for (const item of navItemsFromSections(sections)) {
    if (item.href === "#home") continue;
    add(item.label, item.href);
  }

  return links;
}
