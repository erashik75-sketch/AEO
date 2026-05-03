import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        AEO Platform
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900">
        Scan every signal. Fix what matters. Ship the plan.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-zinc-600">
        Run multi-model probes across Claude, ChatGPT, Perplexity, and Gemini,
        score five AEO signals, auto-run a 30-point checklist, and generate a
        prioritized 30/60/90-day execution roadmap—with fix agents on demand.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/login"
          className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
