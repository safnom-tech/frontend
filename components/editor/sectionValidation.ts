import type { PageSection } from "@/types/page";

function str(data: Record<string, unknown>, key: string): string {
  const v = data[key];
  return typeof v === "string" ? v.trim() : "";
}

function variantOf(section: PageSection): string {
  return String(
    (section.settings as { variant?: string } | undefined)?.variant ?? "default"
  );
}

/** Returns human-readable missing required fields, or empty if valid. */
export function missingRequiredSectionFields(section: PageSection): string[] {
  const d = section.data;
  const variant = variantOf(section);
  const missing: string[] = [];

  switch (section.type) {
    case "HEADER": {
      if (!str(d, "logoText")) missing.push("Business / logo name");
      if (variant === "logistics") {
        if (!str(d, "phone")) missing.push("Phone");
      }
      break;
    }
    case "HERO": {
      if (!str(d, "title")) missing.push("Headline");
      if (!str(d, "buttonText")) missing.push("Primary button label");
      if (variant === "logistics" && !str(d, "imageUrl")) {
        missing.push("Banner image");
      }
      break;
    }
    case "FEATURES": {
      if (variant === "innovation") {
        if (!str(d, "heading")) missing.push("Section title");
        if (!str(d, "body")) missing.push("Supporting paragraph");
        if (!str(d, "signature")) missing.push("Signature name");
        const cards = Array.isArray(d.cards)
          ? (d.cards as { title?: string; body?: string; imageUrl?: string }[])
          : [];
        if (cards.length === 0) {
          missing.push("At least one feature card");
        } else {
          cards.forEach((card, i) => {
            if (!String(card.title ?? "").trim()) {
              missing.push(`Card ${i + 1} title`);
            }
            if (!String(card.body ?? "").trim()) {
              missing.push(`Card ${i + 1} description`);
            }
            if (!String(card.imageUrl ?? "").trim()) {
              missing.push(`Card ${i + 1} image`);
            }
          });
        }
      } else if (variant === "whyChoose") {
        if (!str(d, "heading")) missing.push("Section title");
        if (!str(d, "body")) missing.push("Body text");
        const pillars = Array.isArray(d.pillars) ? d.pillars : [];
        if (pillars.length === 0) missing.push("Pillars");
        if (!str(d, "imageUrl")) missing.push("Main photo");
      } else {
        if (!str(d, "heading")) missing.push("Section title");
        const items = Array.isArray(d.items) ? d.items : [];
        if (items.length === 0) missing.push("Bullet points");
      }
      break;
    }
    case "SERVICES": {
      if (variant === "serviceCards" || variant === "darkServiceGrid") {
        if (variant === "darkServiceGrid" && !str(d, "heading")) {
          missing.push("Section title");
        }
        const items = Array.isArray(d.items) ? d.items : [];
        if (items.length === 0) missing.push("Services list");
        if (!str(d, "activeTitle")) {
          missing.push("Highlighted card title");
        }
      } else {
        if (!str(d, "heading")) missing.push("Section title");
        const items = Array.isArray(d.items) ? d.items : [];
        if (items.length === 0) missing.push("Bullet points");
      }
      break;
    }
    case "FOOTER": {
      if (variant === "logistics") {
        if (!str(d, "logoText")) missing.push("Logo / brand name");
        if (!str(d, "about")) missing.push("About blurb");
        if (!str(d, "copyright")) missing.push("Copyright line");
      } else if (!str(d, "copyright")) {
        missing.push("Copyright line");
      }
      break;
    }
    case "CONTACT": {
      if (!str(d, "heading")) missing.push("Section title");
      break;
    }
    case "TEXT": {
      if (!str(d, "heading")) missing.push("Heading");
      if (!str(d, "body")) missing.push("Paragraph");
      break;
    }
    case "COMPOSED": {
      const section = d.section;
      if (!section || typeof section !== "object") {
        missing.push("Section layout");
      }
      break;
    }
    default:
      break;
  }

  return missing;
}
