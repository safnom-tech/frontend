"use client";

import {
  SiteDocumentHead,
  seoDocumentFields,
} from "@/components/site/SiteDocumentHead";
import { WebsiteRenderer } from "@/components/site/WebsiteRenderer";
import { PublicSiteMediaContext } from "@/contexts/PublicSiteMediaContext";
import type { PublicSiteData } from "@/types/public-site";

export function PublicSiteClient({ data }: { data: PublicSiteData }) {
  const seo = seoDocumentFields(data.page.seo, {
    title: `${data.page.name} · ${data.website.name}`,
    description: data.website.description ?? undefined,
  });

  const inquiryTarget = data.website.publicId
    ? { websitePublicId: data.website.publicId }
    : null;

  return (
    <PublicSiteMediaContext.Provider value={true}>
      <SiteDocumentHead
        title={seo.title}
        description={seo.description}
        socialImage={seo.socialImage}
        slug={data.page.slug}
      />
      <WebsiteRenderer
        theme={data.website.theme ?? {}}
        sections={data.page.sections ?? []}
        revealOnScroll
        inquiryTarget={inquiryTarget}
      />
    </PublicSiteMediaContext.Provider>
  );
}
