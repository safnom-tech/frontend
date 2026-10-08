import type { FieldContentType } from "@/lib/fieldContentAi";

export function inferFieldContentType(
  fieldKey: string,
  multiline?: boolean
): FieldContentType {
  const f = fieldKey.toLowerCase();
  if (f.includes("button") || f === "submitlabel") return "button";
  if (f === "eyebrow") return "eyebrow";
  if (f.endsWith(".title") || f === "title") return "title";
  if (f.endsWith(".body")) return "description";
  if (
    f === "heading" ||
    f === "logotext" ||
    f === "brandwordmark"
  ) {
    return "heading";
  }
  if (
    f.endsWith(".description") ||
    f === "description" ||
    f === "body" ||
    f === "about" ||
    f === "subscribebody"
  ) {
    return "description";
  }
  if (multiline) return "description";
  if (f === "quote") return "quote";
  if (f === "author" || f === "signature") return "author";
  if (f === "price") return "price";
  if (f === "planname") return "planName";
  if (f === "copyright") return "copyright";
  if (f === "navlabel") return "navLabel";
  if (f.includes("alt")) return "alt";
  if (f === "collectionlabel") return "subheading";
  return "generic";
}

export function inferFieldContentTypeFromLabel(
  label: string,
  multiline?: boolean
): FieldContentType {
  const l = label.toLowerCase();
  if (l.includes("eyebrow")) return "eyebrow";
  if (l.includes("headline") || l.includes("section title") || l === "heading") {
    return "heading";
  }
  if (l.includes("logo") || l.includes("brand")) return "logoText";
  if (l.includes("button")) return "button";
  if (l.includes("quote")) return "quote";
  if (l.includes("author") || l.includes("signature")) return "author";
  if (l.includes("price")) return "price";
  if (l.includes("plan")) return "planName";
  if (l.includes("copyright")) return "copyright";
  if (l.includes("paragraph") || l.includes("description") || l.includes("intro") || l.includes("body") || l.includes("blurb")) {
    return "description";
  }
  if (multiline) return "description";
  return inferFieldContentType(l.replace(/[^a-z]/g, ""), multiline);
}
