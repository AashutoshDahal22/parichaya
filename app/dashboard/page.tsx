"use client";

import { useState } from "react";
import { ArrowRight, Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  const {
    profile,
    profileLoading,
    profileError,
    isClaiming,
    claimError,
    claimUsername,
  } = useProfile();

  const [username, setUsername] = useState("");

  const name = user?.user_metadata?.name || "there";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteHost = siteUrl ? new URL(siteUrl).host : "";

  const handleClaim = async () => {
    const success = await claimUsername(username);

    if (success) {
      setUsername("");
    }
  };

  if (isLoading || profileLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-neutral-500">Loading your profile...</p>
      </section>
    );
  }

  if (profileError) {
    return (
      <section className="px-5 py-10 md:px-10">
        <p className="text-sm text-red-600">{profileError}</p>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex-1 bg-[#faf9f6] px-5 py-8 text-neutral-900 md:px-10 md:py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Welcome back, {name}.
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Let's get your corner of the internet ready.
        </p>

        {profile?.username ? (
          <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
            <h2 className="text-xl font-semibold">Your username is claimed!</h2>

            <p className="mt-3 text-sm text-neutral-500">Your personal page:</p>

            <p className="mt-2 font-medium">
              {siteHost}/{profile.username}
            </p>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
            <div className="max-w-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f0eb]">
                <Globe size={20} />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Step 01 — Your identity
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Claim your username.
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Your username is your personal address on the internet. Choose
                something memorable that represents you.
              </p>

              <label
                htmlFor="username"
                className="mt-7 block text-sm font-medium"
              >
                Choose a username
              </label>

              <div className="mt-2 flex flex-col overflow-hidden rounded-xl border border-neutral-200 focus-within:border-neutral-500 sm:flex-row">
                <div className="flex items-center border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 sm:border-b-0 sm:border-r">
                  {siteHost}/
                </div>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  maxLength={20}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isClaiming}
                  className="min-w-0 flex-1 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-300 disabled:opacity-60"
                />
              </div>

              {claimError && (
                <p className="mt-2 text-sm text-red-600">{claimError}</p>
              )}

              <button
                type="button"
                onClick={handleClaim}
                disabled={isClaiming}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isClaiming ? "Claiming..." : "Claim username"}

                {!isClaiming && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
