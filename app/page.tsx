import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { HomeBenefits } from "@/components/marketing/home/HomeBenefits";
import { HomeCtaBand } from "@/components/marketing/home/HomeCtaBand";
import { HomeDiscover } from "@/components/marketing/home/HomeDiscover";
import { HomeHero } from "@/components/marketing/home/HomeHero";
import { HomeProofStrip } from "@/components/marketing/home/HomeProofStrip";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PublicSiteClient } from "@/components/site/PublicSiteClient";
import { loadPublicSite, publicSiteMetadata } from "@/lib/load-public-site";
import { parseTenantSubdomain } from "@/lib/publish-host";

export async function generateMetadata() {
  const host = (await headers()).get("host") ?? "";
  const subdomain = parseTenantSubdomain(host);
  if (subdomain) {
    return publicSiteMetadata(subdomain);
  }
  return {
    title: "SafNom — Build your business website without code",
  };
}

export default async function Home() {
  const host = (await headers()).get("host") ?? "";
  const subdomain = parseTenantSubdomain(host);

  if (subdomain) {
    const data = await loadPublicSite(subdomain);
    if (!data) {
      notFound();
    }
    return (
      <main className="min-h-dvh bg-[var(--editor-bg,#fff)]">
        <PublicSiteClient data={data} />
      </main>
    );
  }

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
