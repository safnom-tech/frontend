import type { Metadata } from "next";
import { LandingCta } from "@/components/marketing/LandingSections";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero } from "@/components/marketing/PageHero";
import { PricingSection } from "@/components/marketing/PricingSection";

export const metadata: Metadata = {
  title: "Pricing — SafNom",
  description: "Start free on SafNom. Simple plans for small businesses as you grow.",
};

export default function PricingPage() {
  return (
    <MarketingLayout>
      <PageHero
        breadcrumb={{ label: "Home", href: "/" }}
        eyebrow="Pricing"
        title="Simple plans that respect small business budgets"
        description="Explore for free, publish when you're ready, and upgrade only when you need more power — no surprise invoices or agency retainers."
      />
      <PricingSection />
      <LandingCta />
    </MarketingLayout>
  );
}
