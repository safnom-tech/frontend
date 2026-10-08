import { HomeBenefits } from "@/components/marketing/home/HomeBenefits";
import { HomeCtaBand } from "@/components/marketing/home/HomeCtaBand";
import { HomeDiscover } from "@/components/marketing/home/HomeDiscover";
import { HomeHero } from "@/components/marketing/home/HomeHero";
import { HomeProofStrip } from "@/components/marketing/home/HomeProofStrip";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function Home() {
  return (
    <MarketingLayout showDevStatus>
      <HomeHero />
      <HomeBenefits />
      <HomeDiscover />
      <HomeProofStrip />
      <HomeCtaBand />
    </MarketingLayout>
  );
}
