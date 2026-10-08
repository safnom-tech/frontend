"use client";

import { MediaLibrary } from "@/components/media/MediaLibrary";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";

export default function DashboardMediaPage() {
  return (
    <WorkspaceRequired>
      <MediaLibrary />
    </WorkspaceRequired>
  );
}
