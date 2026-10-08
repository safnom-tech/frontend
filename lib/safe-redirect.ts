/** Allow only same-origin relative paths (blocks open redirects). */
export function safeInternalPath(
  value: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  return value;
}
