import { getApiBaseUrl } from "@/services/api";
import type { PublicSiteData, PublicSiteResponse } from "@/types/public-site";

export async function fetchPublicSite(
  subdomain: string,
  pageSlug?: string
): Promise<PublicSiteData | null> {
  const qs = pageSlug ? `?pageSlug=${encodeURIComponent(pageSlug)}` : "";
  const url = `${getApiBaseUrl()}/public/sites/${encodeURIComponent(subdomain)}${qs}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 30 },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as PublicSiteResponse;
    return body.data;
  } catch {
    return null;
  }
}
