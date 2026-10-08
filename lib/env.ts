export function getPublicApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ?? "/api/v1"
  ).replace(/\/$/, "");
}
