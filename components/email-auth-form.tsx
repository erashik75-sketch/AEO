"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export function EmailAuthForm({
  magicLinkEnabled,
  heading,
  subtext,
  alternateLink,
}: {
  magicLinkEnabled: boolean;
  heading?: string;
  subtext?: string;
  alternateLink?: { href: string; label: string };
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const showDevBypass =
    process.env.NODE_ENV === "development" && !magicLinkEnabled;

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("nodemailer", {
      email: email.trim().toLowerCase(),
      callbackUrl: "/dashboard",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("We could not send that email. Check the address and try again.");
      return;
    }
    if (res?.url) {
      window.location.href = res.url;
    }
  }

  async function devSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await signIn("dev-email", {
      email: email.trim().toLowerCase(),
      callbackUrl: "/dashboard",
      redirect: true,
    });
    setLoading(false);
  }

  return (
    <>
      {heading ? (
        <h2 className="mt-6 text-center text-lg font-semibold text-slate-900">{heading}</h2>
      ) : null}
      {subtext ? <p className="mt-2 text-center text-sm text-slate-600">{subtext}</p> : null}

      {magicLinkEnabled ? (
        <form onSubmit={sendMagicLink} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Work email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-brand focus:border-transparent focus:ring-2"
              placeholder="you@company.com"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-900/10 transition hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "Sending…" : "Email me a sign-in link"}
          </button>
          <p className="text-center text-xs text-slate-500">
            New and returning users use the same link — we create your workspace the first time you
            sign in.
          </p>
        </form>
      ) : showDevBypass ? (
        <form onSubmit={devSignIn} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dev email (no mail server)
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
            disabled={loading}
            className="w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Continue (dev only)"}
          </button>
          <p className="text-center text-xs text-amber-800">
            Set EMAIL_SERVER_HOST, EMAIL_FROM, and AUTH_SECRET for magic links in production.
          </p>
        </form>
      ) : (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-center text-sm text-amber-950">
          <p className="font-medium">Email sign-in is not configured yet.</p>
          <p className="mt-2 text-xs leading-relaxed">
            Add <code className="rounded bg-amber-100 px-1">AUTH_SECRET</code>,{" "}
            <code className="rounded bg-amber-100 px-1">EMAIL_FROM</code>, and{" "}
            <code className="rounded bg-amber-100 px-1">EMAIL_SERVER_HOST</code> (plus SMTP user/pass
            if required) to enable passwordless magic links.
          </p>
        </div>
      )}

      {alternateLink ? (
        <p className="mt-8 text-center text-sm text-slate-500">
          <Link href={alternateLink.href} className="font-semibold text-brand-dark hover:underline">
            {alternateLink.label}
          </Link>
        </p>
      ) : null}
    </>
  );
}
