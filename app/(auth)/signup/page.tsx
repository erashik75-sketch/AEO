import { EmailAuthForm } from "@/components/email-auth-form";

export default function SignupPage() {
  const magicLinkEnabled =
    !!process.env.EMAIL_SERVER_HOST &&
    !!process.env.EMAIL_FROM &&
    !!process.env.AUTH_SECRET;

  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 text-center shadow-card sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-md">
          <span className="text-xl font-bold">A</span>
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">Sign up</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          No password. Enter your email and we send a link — your account is created the first time
          you complete sign-in.
        </p>
        <EmailAuthForm
          magicLinkEnabled={magicLinkEnabled}
          alternateLink={{ href: "/login", label: "Already have an account? Sign in" }}
        />
      </div>
    </div>
  );
}
