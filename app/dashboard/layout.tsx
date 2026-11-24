import { Suspense } from "react";
import { DashboardGuard } from "./dashboard-guard";
import Loading from "./loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardGuard>{children}</DashboardGuard>
    </Suspense>
  );
}
