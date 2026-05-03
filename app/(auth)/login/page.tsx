import { LoginForm } from "./login-form";

export default function LoginPage() {
  const googleEnabled =
    !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Use Google, magic link (when configured), or dev email in development.
      </p>
      <LoginForm googleEnabled={googleEnabled} />
    </div>
  );
}
