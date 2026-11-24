"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

import {
  LayoutDashboard,
  UserRound,
  Link2,
  Home,
  // Zap,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },
  {
    label: "My Links",
    href: "/dashboard/links",
    icon: Link2,
  },
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
];

export function NavigationUI({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const name = user?.user_metadata?.name || "there";

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-900 md:flex">
      {/* Sidebar */}
      <aside className="flex shrink-0 flex-col border-b border-neutral-200 bg-white p-5 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
        <Link href="/" className="text-xl font-bold tracking-tight">
          parichaya<span className="text-neutral-400">.</span>
        </Link>

        <p className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Workspace
        </p>

        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-neutral-100 font-medium text-neutral-900"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* <div className="mt-10 hidden rounded-xl bg-[#faf9f6] p-4 md:block">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Zap size={16} />
            Your personal space
          </div>

          <p className="mt-2 text-xs leading-5 text-neutral-500">
            One simple page for everything you share online.
          </p>
        </div> */}
        <div className="mt-8 flex items-center gap-3 border-t border-neutral-100 pt-5 md:mt-auto">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8e4dc] font-medium">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {isLoading ? "Loading" : name}
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500 transition hover:text-red-600"
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Every dashboard page renders here */}
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        {children}
      </main>
    </div>
  );
}
