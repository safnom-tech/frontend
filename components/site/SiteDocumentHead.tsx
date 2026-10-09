"use client";

import { useEffect } from "react";

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

export { seoDocumentFields } from "@/lib/seo-document-fields";

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
