import { LoginForm } from "./login-form";

export default function LoginPage() {
  const googleEnabled =
    !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-card sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-md">
          <span className="text-xl font-bold">A</span>
        </div>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to run diagnostics and manage your brands.
        </p>
        <LoginForm googleEnabled={googleEnabled} />
      </div>
    </div>
  );
}
