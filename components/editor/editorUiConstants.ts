import type { SectionType } from "@/types/page";
import type { WebsiteTheme } from "@/types/website";

export const SECTION_DISPLAY: Record<
  SectionType,
  { label: string; description: string }
> = {
  HEADER: { label: "Top bar", description: "Logo and menu label" },
  HERO: { label: "Intro", description: "Big welcome area" },
  TEXT: { label: "Text", description: "Heading and paragraph" },
  IMAGE: { label: "Image", description: "One photo with caption" },
  SERVICES: { label: "Services list", description: "What you offer" },
  FEATURES: { label: "Features list", description: "Highlights" },
  GALLERY: { label: "Photo gallery", description: "Multiple images" },
  TESTIMONIALS: { label: "Testimonial", description: "Customer quote" },
  PRICING: { label: "Pricing", description: "Plan and price" },
  FAQ: { label: "Questions", description: "Common Q&A" },
  CONTACT: { label: "Contact", description: "Email and button" },
  FOOTER: { label: "Footer", description: "Copyright and links" },
  COMPOSED: { label: "Custom section", description: "AI-designed layout" },
};

/** Blocks most pages need — shown first. */
export const QUICK_ADD_TYPES: SectionType[] = [
  "HERO",
  "TEXT",
  "IMAGE",
  "CONTACT",
  "FOOTER",
];

export const MORE_ADD_TYPES: SectionType[] = [
  "HEADER",
  "SERVICES",
  "FEATURES",
  "GALLERY",
  "TESTIMONIALS",
  "PRICING",
  "FAQ",
];

export type ThemePreset = {
  id: string;
  name: string;
  theme: WebsiteTheme;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "teal",
    name: "Teal",
    theme: {
      colors: {
        primary: "#3da6ad",
        secondary: "#1a3a4a",
        background: "#ffffff",
        text: "#1a3a4a",
      },
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    theme: {
      colors: {
        primary: "#2563eb",
        secondary: "#1e3a5f",
        background: "#f8fafc",
        text: "#0f172a",
      },
    },
  },
  {
    id: "forest",
    name: "Forest",
    theme: {
      colors: {
        primary: "#059669",
        secondary: "#14532d",
        background: "#ffffff",
        text: "#14532d",
      },
    },
  },
  {
    id: "slate",
    name: "Slate",
    theme: {
      colors: {
        primary: "#475569",
        secondary: "#0f172a",
        background: "#f1f5f9",
        text: "#0f172a",
      },
    },
  },
];

export function isPinnedSectionType(type: SectionType): boolean {
  return type === "HEADER" || type === "FOOTER";
}

export type SectionFormatPreset = {
  id: string;
  label: string;
  description: string;
  type: SectionType;
  data?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

/** Standard layouts — gallery grids, service strips, etc. */
export const SECTION_FORMAT_PRESETS: SectionFormatPreset[] = [
  {
    id: "gallery-standard",
    label: "Photo gallery",
    description: "Heading + responsive photo grid",
    type: "GALLERY",
    data: {
      heading: "Gallery",
      images: [
        { url: "", alt: "Photo 1" },
        { url: "", alt: "Photo 2" },
        { url: "", alt: "Photo 3" },
        { url: "", alt: "Photo 4" },
      ],
    },
    settings: { paddingY: "md", alignment: "left" },
  },
  {
    id: "gallery-product",
    label: "Product grid",
    description: "Four product tiles with heading",
    type: "GALLERY",
    data: { heading: "Best sellers", viewAllLabel: "VIEW ALL" },
    settings: { variant: "productGrid", paddingY: "md" },
  },
  {
    id: "services-cards",
    label: "Service cards strip",
    description: "Icon row with titles",
    type: "SERVICES",
    data: {
      items: [
        "Air Freight|Fast air cargo",
        "Land Freight|Road transport",
        "Sea Freight|Ocean shipping",
      ],
    },
    settings: { variant: "serviceCards", paddingY: "none" },
  },
  {
    id: "services-dark-grid",
    label: "Services dark grid",
    description: "Bold grid on dark background",
    type: "SERVICES",
    data: {
      heading: "Our services",
      activeTitle: "Air Freight",
      items: [
        "Air Freight|Professional air freight",
        "Land Freight|Land transport",
        "Sea Freight|Ocean freight",
      ],
    },
    settings: {
      variant: "darkServiceGrid",
      paddingY: "none",
      backgroundColor: "#121212",
      textColor: "#ffffff",
    },
  },
  {
    id: "features-innovation",
    label: "Feature cards + intro",
    description: "Two-column story with image cards",
    type: "FEATURES",
    data: {
      heading: "Why us",
      body: "Short intro about your difference.",
      signature: "",
      signatureRole: "",
      cards: [
        { title: "Who we are", body: "Describe your team.", imageUrl: "" },
        { title: "What we do", body: "Describe your offer.", imageUrl: "" },
      ],
    },
    settings: { variant: "innovation", paddingY: "none", backgroundColor: "#ffffff" },
  },
  {
    id: "testimonial-single",
    label: "Testimonial",
    description: "Quote + customer name",
    type: "TESTIMONIALS",
    data: {
      heading: "What clients say",
      quote: "Outstanding service from start to finish.",
      author: "Happy customer",
    },
    settings: { paddingY: "lg", alignment: "center" },
  },
  {
    id: "faq-standard",
    label: "FAQ list",
    description: "Questions and answers",
    type: "FAQ",
    data: {
      heading: "FAQ",
      items: [
        { q: "How do I get started?", a: "Contact us for a quick intro call." },
        { q: "What areas do you serve?", a: "We serve clients nationwide." },
      ],
    },
    settings: { paddingY: "md" },
  },
  {
    id: "pricing-single",
    label: "Pricing plan",
    description: "One plan with feature list",
    type: "PRICING",
    data: {
      heading: "Pricing",
      planName: "Starter",
      price: "$29/mo",
      features: ["Feature one", "Feature two", "Feature three"],
    },
    settings: { paddingY: "lg", alignment: "center" },
  },
];

export function sectionListTitle(
  type: SectionType,
  data: Record<string, unknown>
): string {
  const base = SECTION_DISPLAY[type].label;
  const composedTitle =
    data.section &&
    typeof data.section === "object" &&
    (data.section as { content?: { title?: string } }).content?.title;
  const hint =
    data.title ?? data.heading ?? data.logoText ?? data.planName ?? composedTitle;
  if (typeof hint === "string" && hint.trim()) {
    const short = hint.trim().slice(0, 36);
    return `${base} · ${short}${hint.length > 36 ? "…" : ""}`;
  }
  return base;
}
