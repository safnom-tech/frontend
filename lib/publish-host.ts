const DEFAULT_PLATFORM_DOMAINS = ["safnom.site"];

const RESERVED = new Set([
  "www",
  "app",
  "admin",
  "api",
  "dashboard",
  "login",
  "signup",
  "auth",
  "support",
  "help",
  "mail",
  "status",
  "static",
  "assets",
  "cdn",
]);

export function parsePlatformDomainList(raw: string | undefined): string[] {
  if (!raw?.trim()) return DEFAULT_PLATFORM_DOMAINS;
  const domains = raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  return domains.length > 0 ? domains : DEFAULT_PLATFORM_DOMAINS;
}

export function platformDomainsFromEnv(): string[] {
  return parsePlatformDomainList(
    process.env.NEXT_PUBLIC_PUBLISH_PLATFORM_DOMAINS ??
      process.env.NEXT_PUBLIC_PUBLISH_BASE_DOMAIN
  );
}

function sortDomainsLongestFirst(domains: string[]): string[] {
  return [...domains].sort((a, b) => b.length - a.length);
}

/** Platform apex for the current host (app.safnom.in → safnom.in). */
export function resolvePlatformBaseDomain(
  host: string,
  platformDomains: string[] = platformDomainsFromEnv()
): string | null {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  for (const platform of sortDomainsLongestFirst(platformDomains)) {
    if (hostname === platform || hostname === `www.${platform}`) {
      return platform;
    }
    const suffix = `.${platform}`;
    if (hostname.endsWith(suffix)) {
      return platform;
    }
  }
  return null;
}

/** Default platform when host is localhost (dashboard). */
export function publishBaseDomain(host?: string): string {
  if (host) {
    const resolved = resolvePlatformBaseDomain(host);
    if (resolved) return resolved;
  }
  if (typeof window !== "undefined") {
    const fromBrowser = resolvePlatformBaseDomain(window.location.host);
    if (fromBrowser) return fromBrowser;
  }
  return platformDomainsFromEnv()[0] ?? "safnom.site";
}

export function parseTenantSubdomain(
  host: string,
  platformDomains: string[] = platformDomainsFromEnv()
): string | null {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname) return null;

  const platform = resolvePlatformBaseDomain(host, platformDomains);
  if (!platform) return null;

  if (hostname === platform || hostname === `www.${platform}`) {
    return null;
  }

  const suffix = `.${platform}`;
  if (!hostname.endsWith(suffix)) return null;

  const sub = hostname.slice(0, -suffix.length);
  if (!sub || sub.includes(".")) return null;
  if (RESERVED.has(sub)) return null;
  return sub;
}

export function publicSitePath(subdomain: string, pathSegments: string[] = []) {
  const slugPath =
    pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "";
  return `/sites/${encodeURIComponent(subdomain)}${slugPath}`;
}

export function buildPublicPageUrl(
  subdomain: string,
  pageSlug?: string,
  platformDomain?: string
) {
  const base = platformDomain ?? publishBaseDomain();
  const path =
    pageSlug && pageSlug !== "home" ? `/${pageSlug}` : "";
  const protocol =
    typeof window !== "undefined" && window.location.protocol === "http:"
      ? "http"
      : "https";
  const port =
    typeof window !== "undefined" && window.location.port
      ? `:${window.location.port}`
      : "";
  const hostUsesPlatform =
    typeof window !== "undefined" &&
    resolvePlatformBaseDomain(window.location.host) === base;
  const portSuffix = hostUsesPlatform ? port : "";
  return `${protocol}://${subdomain}.${base}${portSuffix}${path}`;
}
