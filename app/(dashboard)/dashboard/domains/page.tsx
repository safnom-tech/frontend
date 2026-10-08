"use client";

import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function DashboardDomainsPage() {
  const { currentWorkspace } = useWorkspace();

  return (
    <WorkspaceRequired>
      <DashboardPageHeader
        title="Domains"
        description={
          currentWorkspace
            ? `Domain settings for ${currentWorkspace.name}`
            : undefined
        }
      />
      <div className="dashboard-panel max-w-2xl p-8">
        <p className="text-muted">
          Connect custom domains and subdomains to your websites from this
          workspace. Full tooling is planned for a later step.
        </p>
        <p className="mt-4 text-sm text-muted">
          Learn about Safnom domains on the{" "}
          <Link href="/domains" className="font-medium text-brand hover:underline">
            public domains page
          </Link>
          .
        </p>
      </div>
    </WorkspaceRequired>
  );
}
