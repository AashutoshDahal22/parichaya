"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [signup, setSignup] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const loginRef = useRef<HTMLElement>(null);
  const signupRef = useRef<HTMLElement>(null);

  // The blurred side can't be tabbed into or interacted with.
  useEffect(() => {
    if (loginRef.current) loginRef.current.inert = mode !== "login";
    if (signupRef.current) signupRef.current.inert = mode !== "signup";
  }, [mode]);

  const toggleMode = () =>
    setMode((current) => (current === "login" ? "signup" : "login"));

  const updateLogin = (field: keyof typeof login, value: string) => {
    setLogin((current) => ({ ...current, [field]: value }));
  };

  const updateSignup = (field: keyof typeof signup, value: string) => {
    setSignup((current) => ({ ...current, [field]: value }));
  };

  const inputClass =
    "w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5";

  // LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: login.email.trim(),
        password: login.password,
      });

      if (error) {
        throw error;
      }

      setMessage("Login successful!");

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (signup.password !== signup.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const username = signup.username.trim().toLowerCase();

    if (!/^[a-z0-9-]{3,20}$/.test(username)) {
      setError(
        "Username must be 3–20 characters and contain only letters, numbers, and hyphens.",
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signup.email.trim(),
        password: signup.password,
        options: {
          data: {
            name: signup.name.trim(),
            username,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      // If email confirmation is enabled, Supabase won't return a session yet.
      if (!data.session) {
        setMessage(
          "Account created! Please check your email to verify your account.",
        );
        return;
      }

      setMessage("Account created successfully!");

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-4 py-10 text-neutral-900 sm:px-6">
      <div className="w-full max-w-5xl">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight">
            parichaya<span className="text-neutral-400">.</span>
          </Link>
          <p className="mt-2 text-sm text-neutral-500">
            Your space on the internet.
          </p>
        </div>

        {/* Auth container */}
        <div className="relative grid overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/40 md:grid-cols-2">
          {/* Sliding glass */}
          <button
            type="button"
            onClick={toggleMode}
            aria-label={
              mode === "login"
                ? "Switch to create account"
                : "Switch to sign in"
            }
            className={`group absolute inset-y-0 left-0 z-10 hidden w-1/2 cursor-pointer items-center justify-center bg-white/40 backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900 md:flex ${
              mode === "login" ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <span className="flex flex-col items-center gap-3 px-8 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {mode === "login" ? "New here?" : "Already a member?"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition group-hover:bg-neutral-700">
                {mode === "login" ? "Create an account" : "Sign in"}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </button>

          {/* Login */}
          <section
            ref={loginRef}
            aria-hidden={mode !== "login"}
            className={`border-b border-neutral-200 px-6 py-10 sm:px-10 sm:py-12 md:border-b-0 md:border-r md:px-12 ${
              mode === "login" ? "" : "hidden md:block"
            }`}
          >
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Welcome back
              </span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Sign in
              </h1>
              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Access your account and manage your personal page.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={login.email}
                    onChange={(e) => updateLogin("email", e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert("Password recovery will be added later.")
                    }
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={login.password}
                    onChange={(e) => updateLogin("password", e.target.value)}
                    placeholder="Enter your password"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={
                      showLoginPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
                  >
                    {showLoginPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
                <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs text-neutral-400">
                Already a member?
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-neutral-500">
              Welcome back to your personal space.
            </p>

            {/* Mobile-only switch */}
            <p className="mt-6 text-center text-sm text-neutral-500 md:hidden">
              New here?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-neutral-900 underline underline-offset-4"
                disabled={loading}
              >
                Create account
              </button>
            </p>
          </section>

          {/* Signup */}
          <section
            ref={signupRef}
            aria-hidden={mode !== "signup"}
            className={`px-6 py-10 sm:px-10 sm:py-12 md:px-12 ${
              mode === "signup" ? "" : "hidden md:block"
            }`}
          >
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Get started
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Create account
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Set up your page and bring everything together.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full name
                </label>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={signup.name}
                    onChange={(e) => updateSignup("name", e.target.value)}
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-username"
                  className="mb-2 block text-sm font-medium"
                >
                  Username
                </label>
                <div className="flex overflow-hidden rounded-xl border border-neutral-200 focus-within:border-neutral-900">
                  <span className="flex items-center border-r border-neutral-200 bg-neutral-50 px-3 text-xs text-neutral-500">
                    parichaya.com/
                  </span>
                  <input
                    id="signup-username"
                    type="text"
                    required
                    autoComplete="username"
                    maxLength={20}
                    value={signup.username}
                    onChange={(e) =>
                      updateSignup(
                        "username",
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      )
                    }
                    placeholder="yourname"
                    className="min-w-0 flex-1 px-3 py-3 text-sm outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={signup.email}
                    onChange={(e) => updateSignup("email", e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={signup.password}
                    onChange={(e) => updateSignup("password", e.target.value)}
                    placeholder="At least 8 characters"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    aria-label={
                      showSignupPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
                  >
                    {showSignupPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={signup.confirmPassword}
                    onChange={(e) =>
                      updateSignup("confirmPassword", e.target.value)
                    }
                    placeholder="Repeat your password"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-700"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
                <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-6 flex items-start gap-2">
              <CheckCircle2
                size={15}
                className="mt-0.5 shrink-0 text-neutral-400"
              />
              <p className="text-xs leading-5 text-neutral-400">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>

            {/* Mobile-only switch */}
            <p className="mt-6 text-center text-sm text-neutral-500 md:hidden">
              Already a member?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-neutral-900 underline underline-offset-4"
                disabled={loading}
              >
                Login
              </button>
            </p>
          </section>
        </div>

        {/* Feedback */}
        {(error || message) && (
          <div
            role="status"
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
            }`}
          >
            {error || message}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-neutral-400">
          © 2026 parichaya. Made for the curious internet.
        </p>
      </div>
    </main>
  );
}
