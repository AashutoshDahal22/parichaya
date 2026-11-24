"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Circle, Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [claimed, setClaimed] = useState(false);

  const isValidUsername = /^[a-zA-Z0-9-]{3,20}$/.test(username);
  const canClaim = isValidUsername && !claimed;
  const { user, isLoading } = useAuth();
  const name = user?.user_metadata?.name || "there";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteHost = siteUrl ? new URL(siteUrl).host : "";

  const handleClaim = () => {
    if (!canClaim) return;
    setClaimed(true);
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-neutral-900 md:flex">
      {/* Main content */}
      <section className="flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Welcome back, {isLoading ? "Loading" : name}.
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Let's get your corner of the internet ready.
              </p>
            </div>
          </div>

          {/* Username card */}
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
                  {isLoading ? "Loading" : siteHost}/
                </div>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(
                      e.target.value.toLowerCase().replace(/\s/g, ""),
                    );
                    setClaimed(false);
                  }}
                  placeholder="yourname"
                  maxLength={20}
                  className="min-w-0 flex-1 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-300"
                />
              </div>

              <div className="mt-3 flex min-h-5 items-center gap-2 text-xs">
                {claimed ? (
                  <>
                    <CheckCircle2 size={15} className="text-green-600" />
                    <span className="text-green-700">
                      Username claimed locally! Supabase connection comes later.
                    </span>
                  </>
                ) : username.length === 0 ? (
                  <span className="text-neutral-400">
                    3–20 characters. Letters, numbers and hyphens only.
                  </span>
                ) : isValidUsername ? (
                  <>
                    <CheckCircle2 size={15} className="text-green-600" />
                    <span className="text-green-700">
                      Username format looks good.
                    </span>
                  </>
                ) : (
                  <>
                    <Circle size={15} className="text-red-500" />
                    <span className="text-red-500">
                      Use 3–20 letters, numbers or hyphens.
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={handleClaim}
                disabled={!canClaim}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-auto"
              >
                {claimed ? "Username claimed" : "Claim username"}
                {!claimed && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
