import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] min-h-screen flex-col overflow-hidden">
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
