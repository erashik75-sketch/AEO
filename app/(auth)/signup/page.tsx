import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm text-zinc-600">
        We use the same sign-in flow—your account is created on first login.
      </p>
      <Link
        href="/login"
        className="mt-8 block w-full rounded-xl bg-zinc-900 py-3 text-center text-sm font-semibold text-white"
      >
        Continue to sign in
      </Link>
    </div>
  );
}
