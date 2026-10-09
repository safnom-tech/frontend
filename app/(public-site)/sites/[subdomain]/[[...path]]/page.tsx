import { notFound } from "next/navigation";
import { PublicSiteClient } from "@/components/site/PublicSiteClient";
import { loadPublicSite, publicSiteMetadata } from "@/lib/load-public-site";

type PageProps = {
  params: Promise<{ subdomain: string; path?: string[] }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { subdomain, path } = await params;
  return publicSiteMetadata(subdomain, path?.[0]);
}

export default async function PublicSitePage({ params }: PageProps) {
  const { subdomain, path } = await params;
  const data = await loadPublicSite(subdomain, path?.[0]);

  if (!data) {
    notFound();
  }

  return (
    <main className="bg-[var(--editor-bg,#fff)]">
      <PublicSiteClient data={data} />
    </main>
  );
}
