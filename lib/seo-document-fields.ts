import type { PageSeo } from "@/types/page";

export function seoDocumentFields(
  seo: PageSeo | null | undefined,
  fallbacks: { title: string; description?: string }
) {
  const title = seo?.title?.trim() || fallbacks.title;
  const description =
    seo?.metaDescription?.trim() || fallbacks.description || "";
  const socialImage = seo?.socialImage?.trim() || "";
  return { title, description, socialImage };
}
