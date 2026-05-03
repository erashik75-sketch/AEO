import Link from "next/link";
import { ArrowRight, Bot, LineChart, ListChecks, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mesh-bg min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
            <Zap className="h-5 w-5" />
          </span>
          <span className="font-semibold tracking-tight text-slate-900">AEO</span>
        </div>
        <Link
          href="/login"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-8 lg:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark">
            Answer engine optimization
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1]">
            Scan every signal. Fix what matters. Ship the plan.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Multi-model probes across leading AIs, five AEO signals scored per model, an
            automated 30-point checklist, and a prioritized 30/60/90 roadmap—with fix
            agents when you are ready to execute.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-brand-dark"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Bot,
              title: "Multi-LLM probes",
              desc: "Same seven probes across Claude, ChatGPT, Perplexity, and Gemini—where your plan allows.",
            },
            {
              icon: LineChart,
              title: "Signal scoring",
              desc: "Five AEO signals per model plus a synthesized cross-model score and issue list.",
            },
            {
              icon: ListChecks,
              title: "30-point checklist",
              desc: "Auto-verified technical and content checks with founder confirmations where needed.",
            },
            {
              icon: Zap,
              title: "Execution agents",
              desc: "Canonical copy, keywords, consistency, community drafts, outreach, and technical fixes.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="glass-panel rounded-2xl p-6 shadow-card transition hover:shadow-soft"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand-dark">
                <f.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold text-slate-900">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
