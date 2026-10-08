import type { Metadata } from "next";
import {
  AudienceStrip,
  TestimonialsSection,
} from "@/components/marketing/LandingSections";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero } from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Who it's for — SafNom",
  description:
    "SafNom is built for local shops, restaurants, freelancers, coaches, and growing brands.",
};

export default function WhoItsForPage() {
  return (
    <MarketingLayout>
      <PageHero
        breadcrumb={{ label: "Home", href: "/" }}
        eyebrow="Audience"
        title="Built for real businesses, not enterprise IT departments"
        description="If you run the shop floor and the spreadsheet, SafNom is for you — credible websites without hiring a team you don't have."
      />
      <AudienceStrip />
      <TestimonialsSection />
    </MarketingLayout>
  );
}
