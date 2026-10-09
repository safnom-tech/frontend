import { parseTenantSubdomain } from "@/lib/publish-host";

/** True on customer live hosts like `shop.safnom.site` (not dashboard / marketing). */
export function isPublicTenantHost(host?: string): boolean {
  const h =
    host ??
    (typeof window !== "undefined" ? window.location.host : undefined);
  if (!h) return false;
  return parseTenantSubdomain(h) !== null;
}
