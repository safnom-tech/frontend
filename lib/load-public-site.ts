import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  buildPublicPageUrl,
  publishBaseDomain,
  resolvePlatformBaseDomain,
} from "@/lib/publish-host";
import { seoDocumentFields } from "@/lib/seo-document-fields";
import { fetchPublicSite } from "@/services/public-site.api";
import type { PublicSiteData } from "@/types/public-site";

export function isValidPublicSiteData(
  data: PublicSiteData | null | undefined
): data is PublicSiteData {
  return Boolean(data?.website && data.page);
}

export async function loadPublicSite(
  subdomain: string,
  pageSlug?: string
): Promise<PublicSiteData | null> {
  try {
    const data = await fetchPublicSite(subdomain, pageSlug);
    if (!isValidPublicSiteData(data)) return null;
    return data;
  } catch (err) {
    console.error("[public-site] load failed", subdomain, err);
    return null;
  }
}

export async function publicSiteMetadata(
  subdomain: string,
  pageSlug?: string
): Promise<Metadata> {
  try {
    const data = await loadPublicSite(subdomain, pageSlug);
    if (!data) {
      return { title: "Site unavailable" };
    }

    const seo = seoDocumentFields(data.page.seo, {
      title: `${data.page.name} · ${data.website.name}`,
      description: data.website.description ?? undefined,
    });

    const host = (await headers()).get("host") ?? "";
    const platform =
      resolvePlatformBaseDomain(host) ?? publishBaseDomain(host);
    const canonical = buildPublicPageUrl(subdomain, data.page.slug, platform);

    return {
      title: seo.title,
      description: seo.description || undefined,
      alternates: { canonical },
      openGraph: {
        title: seo.title,
        description: seo.description || undefined,
        type: "website",
        url: canonical,
        ...(seo.socialImage ? { images: [{ url: seo.socialImage }] } : {}),
      },
      twitter: {
        card: seo.socialImage ? "summary_large_image" : "summary",
        title: seo.title,
        description: seo.description || undefined,
        ...(seo.socialImage ? { images: [seo.socialImage] } : {}),
      },
    };
  } catch (err) {
    console.error("[public-site] metadata failed", subdomain, err);
    return { title: "Site unavailable" };
  }
}
