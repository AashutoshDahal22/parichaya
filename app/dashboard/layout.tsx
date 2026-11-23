import { Suspense } from "react";
import { DashboardGuard } from "./dashboard-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardGuard>{children}</DashboardGuard>
    </Suspense>
  );
}
