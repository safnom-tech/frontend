"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { BrandThemeProvider } from "@/contexts/BrandThemeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppToaster } from "@/components/ui/AppToaster";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <BrandThemeProvider>
      <ThemeProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <ConfirmProvider>
              {children}
              <AppToaster />
            </ConfirmProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrandThemeProvider>
  );
}
