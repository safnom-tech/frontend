import type { Metadata } from "next";
import { DomainsSection } from "@/components/marketing/DomainsSection";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero } from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Domains — SafNom",
  description:
    "Use a free SafNom subdomain, connect a domain you own, or purchase a new name through SafNom.",
};

export default function DomainsPage() {
  return (
    <MarketingLayout>
      <PageHero
        breadcrumb={{ label: "Home", href: "/" }}
        eyebrow="Domains"
        title="Purchase a domain or connect one you already own"
        description="Start on a free safnom.site address today. When you're ready for yourbrand.com, connect DNS in a few steps — or buy a domain directly in SafNom soon."
      />
      <DomainsSection />
    </MarketingLayout>
  );
}
