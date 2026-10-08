import { Suspense } from "react";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import WebsitePreviewPage from "./PreviewClient";

export default function PreviewPage() {
  return (
    <WorkspaceRequired>
      <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[var(--dash-bg,#f4f6f8)]">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center text-sm text-muted">
              Loading preview…
            </div>
          }
        >
          <WebsitePreviewPage />
        </Suspense>
      </div>
    </WorkspaceRequired>
  );
}
