"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export function LoginForm({
  googleEnabled,
}: {
  googleEnabled: boolean;
}) {
  const [email, setEmail] = useState("");

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault();
    await signIn("dev-email", {
      email,
      callbackUrl: "/dashboard",
      redirect: true,
    });
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <>
      {googleEnabled ? (
        <button
          type="button"
          onClick={handleGoogle}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      ) : (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          Google sign-in is not configured. Add{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">AUTH_GOOGLE_ID</code>{" "}
          and{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">AUTH_GOOGLE_SECRET</code>.
        </div>
      )}

      {process.env.NODE_ENV === "development" ? (
        <form onSubmit={handleDevLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dev email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-brand focus:border-transparent focus:ring-2"
              placeholder="you@company.com"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-900/10 transition hover:bg-brand-dark"
          >
            Continue with email
          </button>
        </form>
      ) : null}

      <p className="mt-8 text-center text-sm text-slate-500">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand-dark hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
