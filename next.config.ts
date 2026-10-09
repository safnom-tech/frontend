import type { NextConfig } from "next";

/** API traffic is proxied at runtime in `app/api/v1/[...path]/route.ts` (uses BACKEND_URL). */
const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "") ?? "";

const nextConfig: NextConfig = {
  env: backendUrl
    ? {
        /** Live customer sites call the API host directly (same as BACKEND_URL). */
        NEXT_PUBLIC_BACKEND_API_URL: backendUrl,
      }
    : {},
};

export default nextConfig;
