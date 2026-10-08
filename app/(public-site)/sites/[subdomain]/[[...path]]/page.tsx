import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PublicSiteClient } from "@/components/site/PublicSiteClient";
import {
  buildPublicPageUrl,
  publishBaseDomain,
  resolvePlatformBaseDomain,
} from "@/lib/publish-host";
import { seoDocumentFields } from "@/components/site/SiteDocumentHead";
import { fetchPublicSite } from "@/services/public-site.api";

type PageProps = {
  params: Promise<{ subdomain: string; path?: string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain, path } = await params;
  const pageSlug = path?.[0];
  const data = await fetchPublicSite(subdomain, pageSlug);

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
    other: {
      "safnom:base-domain": platform,
    },
  };
}

export default async function PublicSitePage({ params }: PageProps) {
  const { subdomain, path } = await params;
  const pageSlug = path?.[0];
  const data = await fetchPublicSite(subdomain, pageSlug);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-[var(--editor-bg,#fff)]">
      <PublicSiteClient data={data} />
    </main>
  );
}
