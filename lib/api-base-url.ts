import { isPublicTenantHost } from "@/lib/public-tenant-host";
import { publishBaseDomain } from "@/lib/publish-host";

function withApiV1(origin: string): string {
  const base = origin.replace(/\/$/, "");
  if (base.endsWith("/api/v1")) return base;
  return `${base}/api/v1`;
}

function browserBackendOrigin(): string | null {
  const fromEnv =
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (fromEnv) {
    return withApiV1(fromEnv.replace(/\/api\/v1\/?$/, ""));
  }
  return null;
}

/**
 * Base URL for API requests.
 * - Dashboard on safnom.site: same-origin `/api/v1` (Next proxy → BACKEND_URL).
 * - Live tenant hosts (*.safnom.site): direct backend (never tenant subdomain /api).
 * - Server Components: BACKEND_URL.
 */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    if (isPublicTenantHost()) {
      const backend = browserBackendOrigin();
      if (backend) return backend;
      if (configured?.startsWith("http")) {
        return withApiV1(configured.replace(/\/api\/v1\/?$/, ""));
      }
      const platform = publishBaseDomain(window.location.host);
      return `https://${platform}/api/v1`;
    }
    if (configured?.startsWith("http")) {
      return withApiV1(configured.replace(/\/api\/v1\/?$/, ""));
    }
    return configured ?? "/api/v1";
  }

  const backend =
    process.env.BACKEND_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/api\/v1\/?$/, "").replace(
      /\/$/,
      ""
    );
  if (backend) {
    return `${backend}/api/v1`;
  }
  if (configured?.startsWith("http")) {
    return configured;
  }
  return "http://localhost:8080/api/v1";
}
