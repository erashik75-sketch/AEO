import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 text-center shadow-card sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-muted text-2xl">
          ✉️
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">Check your inbox</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We sent a sign-in link to your email. The link expires after a while for security. If you
          do not see it, check spam or promotions.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block text-sm font-semibold text-brand-dark hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
