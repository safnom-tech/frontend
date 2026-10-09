"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { BrandThemeProvider } from "@/contexts/BrandThemeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppToaster } from "@/components/ui/AppToaster";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";

export function Providers({
  children,
  publicSite = false,
}: {
  children: ReactNode;
  publicSite?: boolean;
}) {
  return (
    <BrandThemeProvider>
      <ThemeProvider>
        <AuthProvider skipAuth={publicSite}>
          <WorkspaceProvider>
            <ConfirmProvider>
              {children}
              {publicSite ? null : <AppToaster />}
            </ConfirmProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrandThemeProvider>
  );
}
