import type { PageSection } from "@/types/page";
import { missingRequiredSectionFields } from "@/components/editor/sectionValidation";

function variantOf(section: PageSection): string {
  return String(
    (section.settings as { variant?: string } | undefined)?.variant ?? "default"
  );
}

/** First missing required field DOM key (`data-safnom-field`) for inline focus. */
export function firstMissingInlineFieldKey(section: PageSection): string | null {
  const missing = missingRequiredSectionFields(section);
  if (missing.length === 0) return null;
  const label = missing[0]!;
  const variant = variantOf(section);
  const d = section.data;

  switch (section.type) {
    case "HEADER":
      if (label.includes("logo") || label.includes("Business")) return "logoText";
      if (label.includes("Phone")) return "phone";
      break;
    case "HERO":
      if (label.includes("Headline")) return "title";
      if (label.includes("button")) return "buttonText";
      if (label.includes("Banner")) return "imageUrl";
      break;
    case "FEATURES":
      if (label.includes("Section title")) return "heading";
      if (label.includes("Supporting") || label.includes("Body")) return "body";
      if (label.includes("Signature")) return "signature";
      if (label.includes("Card 1 title")) return "cards.0.title";
      if (label.startsWith("Card ") && label.includes("title")) {
        const m = label.match(/Card (\d+)/);
        if (m) return `cards.${Number(m[1]) - 1}.title`;
      }
      if (label.includes("Main photo")) return "imageUrl";
      if (label.includes("Bullet")) return "items";
      break;
    case "SERVICES":
      if (label.includes("Section title")) return "heading";
      if (label.includes("Highlighted")) return "activeTitle";
      if (label.includes("Services") || label.includes("Bullet")) return "items";
      break;
    case "FOOTER":
      if (label.includes("Logo")) return "logoText";
      if (label.includes("About")) return "about";
      if (label.includes("Copyright")) return "copyright";
      break;
    case "CONTACT":
      if (label.includes("Section title")) return "heading";
      break;
    case "TEXT":
      if (label.includes("Heading")) return "heading";
      if (label.includes("Paragraph")) return "body";
      break;
    default:
      break;
  }

  void variant;
  void d;
  return null;
}

export function focusInlineSectionField(fieldKey: string) {
  const el = document.querySelector(
    `[data-safnom-field="${CSS.escape(fieldKey)}"]`
  ) as HTMLElement | null;
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.focus();
  return true;
}
