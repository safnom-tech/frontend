const SUBDOMAIN_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

export function normalizeSubdomainInput(raw: string): string {
  return raw.trim().toLowerCase();
}

export type SubdomainValidation =
  | { ok: true; normalized: string }
  | { ok: false; message: string };

/** Client-side checks aligned with backend publish validation (availability still server-side). */
export function validateSubdomainFormat(raw: string): SubdomainValidation {
  const normalized = normalizeSubdomainInput(raw);
  if (!normalized) {
    return { ok: false, message: "Enter a subdomain to go live." };
  }
  if (normalized.length < 2 || normalized.length > 64) {
    return { ok: false, message: "Subdomain must be 2–64 characters." };
  }
  if (!SUBDOMAIN_PATTERN.test(normalized)) {
    return {
      ok: false,
      message: "Use lowercase letters, numbers, and hyphens only (e.g. my-shop).",
    };
  }
  if (RESERVED.has(normalized)) {
    return { ok: false, message: `"${normalized}" is reserved. Pick another name.` };
  }
  return { ok: true, normalized };
}

export function buildLiveSiteUrl(
  subdomain: string,
  platformDomain: string
): string {
  const check = validateSubdomainFormat(subdomain);
  if (!check.ok) return "";
  return `https://${check.normalized}.${platformDomain.replace(/^\./, "")}`;
}

/** Ensures absolute https URL (fixes legacy API values like `https//host`). */
export function normalizePublicSiteUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  let fixed = url.trim();
  fixed = fixed.replace(/^https\/\//i, "https://").replace(/^http\/\//i, "http://");
  if (!/^https?:\/\//i.test(fixed)) {
    fixed = `https://${fixed.replace(/^\/+/, "")}`;
  }
  return fixed;
}

export function resolveLiveSiteHref(
  publicUrl: string | null | undefined,
  subdomain: string | null | undefined,
  platformDomain: string
): string | null {
  const fromApi = normalizePublicSiteUrl(publicUrl);
  if (fromApi) return fromApi;
  const sub = subdomain?.trim();
  if (!sub) return null;
  const built = buildLiveSiteUrl(sub, platformDomain);
  return built || null;
}
