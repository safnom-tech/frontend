"use client";

import { useEffect } from "react";
import type { PageSeo } from "@/types/page";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Map page SEO fields for document head (preview now; public publish later). */
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

export function SiteDocumentHead({
  title,
  description,
  socialImage,
  slug,
}: {
  title: string;
  description?: string;
  socialImage?: string;
  slug?: string;
}) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }
    upsertMeta("property", "og:title", title);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("property", "og:type", "website");
    if (socialImage) {
      upsertMeta("property", "og:image", socialImage);
      upsertMeta("name", "twitter:image", socialImage);
      upsertMeta("name", "twitter:card", "summary_large_image");
    }
    if (slug) {
      upsertMeta("name", "safnom:page-slug", slug);
    }
    return () => {
      document.title = prev;
    };
  }, [title, description, socialImage, slug]);

  return null;
}
