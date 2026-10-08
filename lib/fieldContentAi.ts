export const FIELD_CONTENT_TYPES = [
  "heading",
  "subheading",
  "title",
  "eyebrow",
  "description",
  "body",
  "button",
  "quote",
  "author",
  "planName",
  "price",
  "copyright",
  "navLabel",
  "logoText",
  "alt",
  "generic",
] as const;

export type FieldContentType = (typeof FIELD_CONTENT_TYPES)[number];

/** Headings and long-form description fields only — not buttons, stats, labels, etc. */
const AI_GENERATABLE_FIELD_TYPES = new Set<FieldContentType>([
  "heading",
  "title",
  "description",
  "body",
]);

export function fieldTypeSupportsAiGeneration(type: FieldContentType): boolean {
  return AI_GENERATABLE_FIELD_TYPES.has(type);
}

export type FieldContentLimit = {
  maxChars: number;
  defaultMaxWords?: number;
  hardMaxWords?: number;
  allowsWordLimit?: boolean;
};

export const FIELD_CONTENT_LIMITS: Record<FieldContentType, FieldContentLimit> = {
  heading: { maxChars: 200 },
  subheading: { maxChars: 200 },
  title: { maxChars: 200 },
  eyebrow: { maxChars: 120 },
  description: {
    maxChars: 8000,
    defaultMaxWords: 50,
    hardMaxWords: 500,
    allowsWordLimit: true,
  },
  body: {
    maxChars: 8000,
    defaultMaxWords: 80,
    hardMaxWords: 800,
    allowsWordLimit: true,
  },
  button: { maxChars: 80 },
  quote: {
    maxChars: 2000,
    defaultMaxWords: 60,
    hardMaxWords: 200,
    allowsWordLimit: true,
  },
  author: { maxChars: 120 },
  planName: { maxChars: 120 },
  price: { maxChars: 80 },
  copyright: { maxChars: 200 },
  navLabel: { maxChars: 80 },
  logoText: { maxChars: 120 },
  alt: { maxChars: 300 },
  generic: {
    maxChars: 500,
    defaultMaxWords: 40,
    hardMaxWords: 120,
    allowsWordLimit: true,
  },
};

export function fieldContentTypeLabel(type: FieldContentType): string {
  const labels: Record<FieldContentType, string> = {
    heading: "Heading",
    subheading: "Subheading",
    title: "Title",
    eyebrow: "Eyebrow",
    description: "Description",
    body: "Body text",
    button: "Button text",
    quote: "Quote",
    author: "Author",
    planName: "Plan name",
    price: "Price",
    copyright: "Copyright",
    navLabel: "Nav label",
    logoText: "Logo / brand name",
    alt: "Image alt text",
    generic: "Text",
  };
  return labels[type];
}

export function clampFieldMaxWords(
  fieldType: FieldContentType,
  maxWords: number
): number {
  const limits = FIELD_CONTENT_LIMITS[fieldType];
  if (!limits.allowsWordLimit) return maxWords;
  const cap = limits.hardMaxWords ?? maxWords;
  return Math.min(Math.max(5, Math.floor(maxWords)), cap);
}

export function wordCountOfText(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function currentLengthMaxMultiplier(fieldType: FieldContentType): number {
  return fieldType === "description" ? 4 : 1.3;
}

/** Match backend: existing copy sets the floor; growth cap depends on field type. */
export function resolveLengthBoundsFromCurrentValue(
  fieldType: FieldContentType,
  currentValue: string | undefined,
  limits: { maxChars: number; maxWords?: number }
): {
  minChars: number | null;
  maxChars: number;
  minWords: number | null;
  maxWords: number | undefined;
} {
  const mult = currentLengthMaxMultiplier(fieldType);
  const trimmed = currentValue?.trim() ?? "";
  const minChars = trimmed.length > 0 ? trimmed.length : null;
  let maxChars = limits.maxChars;
  if (minChars !== null) {
    const ceiling = Math.max(minChars, Math.ceil(minChars * mult));
    maxChars = Math.min(limits.maxChars, ceiling);
  }

  const wc = wordCountOfText(trimmed);
  const minWords = wc > 0 ? wc : null;
  let maxWords = limits.maxWords;
  if (minWords !== null) {
    const wordCeiling = Math.max(minWords, Math.ceil(minWords * mult));
    if (maxWords !== undefined) {
      maxWords = Math.min(maxWords, wordCeiling);
      maxWords = Math.max(maxWords, minWords);
    } else {
      maxWords = wordCeiling;
    }
  }

  return { minChars, maxChars, minWords, maxWords };
}

export function defaultMaxWordsFromCurrentText(
  fieldType: FieldContentType,
  currentValue: string | undefined,
  fallback: number
): number {
  const wc = wordCountOfText(currentValue ?? "");
  if (wc <= 0) return fallback;
  return clampFieldMaxWords(
    fieldType,
    Math.ceil(wc * currentLengthMaxMultiplier(fieldType))
  );
}

export function formatCharacterLimitLabel(bounds: {
  minChars: number | null;
  maxChars: number;
}): string {
  if (bounds.minChars != null) {
    return `${bounds.minChars}–${bounds.maxChars} characters`;
  }
  return `Up to ${bounds.maxChars} characters`;
}

export function formatWordLimitLabel(bounds: {
  minWords: number | null;
  maxWords: number | undefined;
  wordCap: number;
}): string {
  const max = bounds.maxWords ?? bounds.wordCap;
  if (bounds.minWords != null) {
    return `${bounds.minWords}–${max} words`;
  }
  return `5–${max} words`;
}
