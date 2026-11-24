import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavigationUI } from "./dashboard-layout";

type DashboardGuardProps = {
  children: React.ReactNode;
};

export async function DashboardGuard({ children }: DashboardGuardProps) {
  // Wait until an actual request comes in.
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return <NavigationUI>{children}</NavigationUI>;
}
