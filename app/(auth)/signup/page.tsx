import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 text-center shadow-card sm:p-10">
        <h1 className="text-2xl font-semibold text-slate-900">Create your workspace</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Accounts are created automatically on first sign-in—no separate signup API.
          Use Google or dev email (in development) from the sign-in page.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-dark"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}
