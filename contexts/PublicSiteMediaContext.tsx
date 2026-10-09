"use client";

import { createContext, useContext } from "react";
import { isPublicTenantHost } from "@/lib/public-tenant-host";

/** True when rendering a published customer site (live subdomain or /sites rewrite). */
export const PublicSiteMediaContext = createContext(false);

export function usePublicSiteMedia(): boolean {
  const fromContext = useContext(PublicSiteMediaContext);
  return fromContext || isPublicTenantHost();
}
