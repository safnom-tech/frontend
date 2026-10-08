import type { Metadata } from "next";
import {
  HowItWorks,
  WhySafNomSection,
} from "@/components/marketing/LandingSections";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero } from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "How it works — SafNom",
  description:
    "Four simple steps from signup to a live business website on SafNom.",
};

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      <PageHero
        breadcrumb={{ label: "Home", href: "/" }}
        eyebrow="Process"
        title="From signup to live site in a focused workflow"
        description="No developer handoffs or endless revisions. Follow a guided path designed for busy owners who need results this week, not next quarter."
      />
      <HowItWorks showIntro={false} />
      <WhySafNomSection />
    </MarketingLayout>
  );
}
