/**
 * Base URL for API requests.
 * Browser (dashboard + live subdomains): always same-origin `/api/v1`
 * so Next.js can proxy to BACKEND_URL (avoids Render 502 HTML on cold start).
 * Server Components: BACKEND_URL directly.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/v1";
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

  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured?.startsWith("http")) {
    return configured;
  }

  return "http://localhost:8080/api/v1";
}
