import { getApiBaseUrl } from "@/lib/api-base-url";
import type { PublicSiteData, PublicSiteResponse } from "@/types/public-site";

export async function fetchPublicSite(
  subdomain: string,
  pageSlug?: string
): Promise<PublicSiteData | null> {
  const qs = pageSlug ? `?pageSlug=${encodeURIComponent(pageSlug)}` : "";
  const url = `${getApiBaseUrl()}/public/sites/${encodeURIComponent(subdomain)}${qs}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error("[public-site] API status", response.status, url);
      return null;
    }

    const body = (await response.json()) as PublicSiteResponse;
    const data = body?.data;
    if (!data?.website || !data.page) {
      return null;
    }
    return data;
  } catch (err) {
    console.error("[public-site] fetch failed", url, err);
    return null;
  }
}
