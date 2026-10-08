import type { Metadata } from "next";
import { AboutSection } from "@/components/marketing/AboutSection";
import { WhySafNomSection } from "@/components/marketing/LandingSections";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero } from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "About — SafNom",
  description:
    "SafNom democratizes the web for small businesses with an all-in-one website platform.",
};

export default function AboutPage() {
  return (
    <MarketingLayout>
      <PageHero
        breadcrumb={{ label: "Home", href: "/" }}
        eyebrow="Company"
        title="Democratizing the web for every business"
        description="We believe a professional online presence should be accessible to the shop on your street — not just companies with six-figure marketing budgets."
      />
      <AboutSection />
      <WhySafNomSection />
    </MarketingLayout>
  );
}
