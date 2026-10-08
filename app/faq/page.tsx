import type { Metadata } from "next";
import { FaqSection, LandingCta } from "@/components/marketing/LandingSections";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero } from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "FAQ — SafNom",
  description: "Answers about SafNom pricing, domains, security, and getting started.",
};

export default function FaqPage() {
  return (
    <MarketingLayout>
      <PageHero
        breadcrumb={{ label: "Home", href: "/" }}
        eyebrow="Support"
        title="Frequently asked questions"
        description="Straight answers for owners evaluating their next move online — skills required, what's included, and how SafNom compares."
      />
      <FaqSection showIntro={false} />
      <LandingCta />
    </MarketingLayout>
  );
}
