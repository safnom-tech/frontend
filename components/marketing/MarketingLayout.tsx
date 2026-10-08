import type { ReactNode } from "react";
import { DevStatusBadge } from "@/components/marketing/DevStatusBadge";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function MarketingLayout({
  children,
  showDevStatus = false,
}: {
  children: ReactNode;
  showDevStatus?: boolean;
}) {
  return (
    <div className="page-mesh flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {showDevStatus ? (
        <div className="border-t border-card-border/50 py-3 text-center">
          <DevStatusBadge />
        </div>
      ) : null}
    </div>
  );
}
