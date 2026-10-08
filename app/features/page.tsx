import type { Metadata } from "next";
import {
  FeatureGrid,
  PlatformHighlights,
} from "@/components/marketing/LandingSections";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero } from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Features — SafNom",
  description:
    "Templates, hosting, SSL, AI content, and one dashboard for small business websites.",
};

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <PageHero
        breadcrumb={{ label: "Home", href: "/" }}
        eyebrow="Product"
        title="Everything included to look professional online"
        description="SafNom bundles the tools owners usually patch together — design, hosting, security, and content — so you can launch faster and stay in control."
      />
      <FeatureGrid showIntro={false} />
      <PlatformHighlights />
    </MarketingLayout>
  );
}
