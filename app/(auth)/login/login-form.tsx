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
          className="mt-8 w-full rounded-xl border border-zinc-300 bg-white py-3 text-sm font-medium"
        >
          Continue with Google
        </button>
      ) : (
        <p className="mt-8 text-sm text-amber-800">
          Google sign-in is not configured. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET.
        </p>
      )}

      {process.env.NODE_ENV === "development" ? (
        <form onSubmit={handleDevLogin} className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-zinc-700">Dev email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="you@company.com"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white"
          >
            Dev sign in
          </button>
        </form>
      ) : null}

      <p className="mt-8 text-center text-sm text-zinc-500">
        No account?{" "}
        <Link href="/signup" className="font-medium text-zinc-900 underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
