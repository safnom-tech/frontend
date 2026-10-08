import { BusinessProfilePanel } from "@/components/dashboard/BusinessProfilePanel";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";

export default function BusinessProfilePage() {
  return (
    <WorkspaceRequired>
      <BusinessProfilePanel />
    </WorkspaceRequired>
  );
}
