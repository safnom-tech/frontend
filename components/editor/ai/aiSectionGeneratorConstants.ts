import type { ComposedDesignStyle, ComposedSectionTypeHint } from "@/types/ai";

export const PROMPT_EXAMPLES = [
  "We help brands scale paid social. Explain our four-step process: read performance data, pick the next creative, senior designers build it, results drive what comes next.",
  "Logistics and freight company — showcase industries we serve: logistics, delivery, construction, and home services. Keep labels short and confident.",
];

export const SECTION_TYPE_OPTIONS: { value: ComposedSectionTypeHint | ""; label: string }[] = [
  { value: "", label: "Let AI decide" },
  { value: "hero", label: "Hero" },
  { value: "about", label: "About" },
  { value: "services", label: "Services" },
  { value: "features", label: "Features" },
  { value: "portfolio", label: "Portfolio" },
  { value: "testimonials", label: "Testimonials" },
  { value: "pricing", label: "Pricing" },
  { value: "contact", label: "Contact" },
  { value: "faq", label: "FAQ" },
  { value: "team", label: "Team" },
  { value: "custom", label: "Custom" },
];

export const DESIGN_STYLE_OPTIONS: { value: ComposedDesignStyle | ""; label: string }[] = [
  { value: "", label: "Match my website" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "premium", label: "Premium" },
  { value: "editorial", label: "Editorial" },
  { value: "corporate", label: "Corporate" },
  { value: "creative", label: "Creative" },
  { value: "luxury", label: "Luxury" },
  { value: "bold", label: "Bold" },
  { value: "glassmorphism", label: "Glassmorphism" },
  { value: "custom", label: "Custom" },
];

export const ADDITIONAL_REQUIREMENT_OPTIONS = [
  "Image gallery",
  "Carousel",
  "Tabs",
  "Accordion",
  "Video",
  "Testimonials slider",
  "Pricing toggle",
  "Contact form",
  "Social links",
  "Statistics",
  "Animations",
  "Hover interactions",
  "Responsive behavior",
] as const;
