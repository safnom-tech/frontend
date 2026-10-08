import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceRequired>
      <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[var(--dash-bg,#f4f6f8)]">
        {children}
      </div>
    </WorkspaceRequired>
  );
}
