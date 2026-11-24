"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f6]";

const RESEND_SECONDS = 30;

function VerifyEmail() {
  // Usage: /verify-email?email=you@example.com
  const email = useSearchParams().get("email");

  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0) return;
    // TODO: call your "resend verification email" endpoint here
    setResent(true);
    setCooldown(RESEND_SECONDS);
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center md:py-24">
      {/* Animated mail icon */}
      <div className="relative size-28">
        {/* Square ripples radiating outward */}
        <span
          aria-hidden="true"
          className="absolute inset-0 border border-neutral-900/25 animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite] motion-reduce:hidden"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 border border-neutral-900/25 animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_1.2s_infinite] motion-reduce:hidden"
        />

        {/* Stacked card behind, same as the home page card */}
        <span
          aria-hidden="true"
          className="absolute inset-x-3 -bottom-2 top-2 bg-[#e9e5dc]"
        />

        {/* Tile */}
        <div className="relative flex size-full items-center justify-center bg-neutral-900 text-white">
          <Mail size={40} strokeWidth={1.5} aria-hidden="true" />

          {/* Unread dot */}
          <span
            aria-hidden="true"
            className="absolute right-7 top-7 flex size-2.5"
          >
            <span className="absolute inline-flex size-full bg-[#e8e4dc] opacity-75 animate-ping motion-reduce:hidden" />
            <span className="relative inline-flex size-2.5 bg-[#e8e4dc]" />
          </span>
        </div>
      </div>

      <h1 className="mt-14 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">
        Check your email
        <span className="mt-3 block leading-[1.25] text-neutral-400">
          इमेल हेर्नुहोस्।
        </span>
      </h1>

      <p className="mt-6 text-base leading-7 text-neutral-500">
        We sent a verification link to
      </p>

      <p className="mt-3 max-w-full break-all border border-neutral-200 bg-white px-4 py-2 text-sm font-medium">
        {email ?? "your email address"}
      </p>

      <p className="mt-3 text-base leading-7 text-neutral-500">
        Click the link inside to finish setting up your page.
      </p>

      <div className="mt-10 w-full">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className={`inline-flex h-12 w-full items-center justify-center border border-neutral-200 bg-white px-7 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-400 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-neutral-400 ${focusRing}`}
        >
          {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend email"}
        </button>

        <p
          role="status"
          aria-live="polite"
          className="mt-3 h-5 text-xs text-neutral-500"
        >
          {resent ? "A new verification link is on its way." : ""}
        </p>
      </div>

      <p className="mt-8 w-full border-t border-neutral-200 pt-6 text-xs leading-6 text-neutral-400">
        Can&apos;t find it? Check your spam or promotions folder.
        <br />
        Wrong address?{" "}
        <Link
          href="/auth"
          className={`font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600 ${focusRing}`}
        >
          Use a different email
        </Link>
      </p>
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#faf9f6] text-neutral-900 antialiased">
      {/* Navigation */}
      <header className="border-b border-neutral-200">
        <nav className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className={`text-xl font-semibold tracking-tight ${focusRing}`}
          >
            parichaya<span className="text-neutral-400">.</span>
          </Link>

          <Link
            href="/auth"
            className={`text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 ${focusRing}`}
          >
            Sign in
          </Link>
        </nav>
      </header>

      <Suspense fallback={<div className="flex-1" />}>
        <VerifyEmail />
      </Suspense>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex h-20 w-full max-w-6xl flex-col items-center justify-center gap-3 px-6 sm:flex-row sm:justify-between sm:gap-4">
          <Link
            href="/"
            className={`text-base font-semibold tracking-tight ${focusRing}`}
          >
            parichaya<span className="text-neutral-400">.</span>
          </Link>

          <span className="text-xs text-neutral-400">© 2026 parichaya.</span>
        </div>
      </footer>
    </main>
  );
}
