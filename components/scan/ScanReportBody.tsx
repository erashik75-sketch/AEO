"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { SignalBar } from "@/components/shared/SignalBar";
import { ModelComparison } from "@/components/scan/ModelComparison";
import { IssueCard } from "@/components/scan/IssueCard";
import { DeepDiveTabs } from "@/components/scan/DeepDiveTab";
import { ChatSection } from "@/components/scan/ChatSection";
import { ScanProgress } from "@/components/scan/ScanProgress";
import { ChecklistView } from "@/components/checklist/ChecklistView";
import { PlanTimeline } from "@/components/plan/PlanTimeline";
import { AgentCard } from "@/components/agents/AgentCard";
import { SuggestionCard } from "@/components/agents/SuggestionCard";
import { NON_MVP_AGENT_SUGGESTIONS } from "@/lib/agents/suggestions";
import type { AgentId } from "@/lib/agents/runner";
import { cn } from "@/lib/utils";

type Issue = {
  id: string;
  title: string;
  brief: string;
  severity: string;
  score: number;
  model?: string;
};

export function ScanReportBody({
  scanId,
  brandId,
  brandName,
  initial,
}: {
  scanId: string;
  brandId: string;
  brandName: string;
  initial: {
    scan: {
      status: string;
      summary: string | null;
      crossModelScore: number | null;
      probeContext: string | null;
      issues: unknown;
      claudeScores: unknown;
      openaiScores: unknown;
      perplexityScores: unknown;
      geminiScores: unknown;
      modelFailures: unknown;
      checklistRun: {
        overallScore: number;
        items: Array<{
          id: string;
          checkId: string;
          name: string;
          status: string;
          aeoImpact: string;
          detail: string;
        }>;
      } | null;
    };
    plan: {
      summary: unknown;
      tasks: Array<{
        id: string;
        title: string;
        phase: number;
        owner: string;
        status: string;
        signalImproved: string;
      }>;
    } | null;
  };
}) {
  const [agentOut, setAgentOut] = useState<string | null>(null);
  const [deepIssue, setDeepIssue] = useState<Issue | null>(null);
  const [issueTab, setIssueTab] = useState<"universal" | "specific">("universal");

  const scan = initial.scan;

  const issues = useMemo(() => (scan.issues as Issue[]) ?? [], [scan.issues]);

  const modelScores = useMemo(() => {
    const g = (raw: unknown): number | undefined =>
      raw && typeof raw === "object" && "overall" in raw
        ? Number((raw as { overall: number }).overall)
        : undefined;
    return {
      claude: g(scan.claudeScores),
      openai: g(scan.openaiScores),
      perplexity: g(scan.perplexityScores),
      gemini: g(scan.geminiScores),
    };
  }, [scan]);

  const avgSignals = useMemo(() => {
    const merge = [scan.claudeScores, scan.openaiScores, scan.perplexityScores, scan.geminiScores].filter(
      Boolean
    ) as Array<{ scores?: Record<string, number> }>;
    if (!merge.length)
      return {
        category_clarity: 0,
        usecase_saturation: 0,
        comparison_coverage: 0,
        entity_association: 0,
        authoritative_definition: 0,
      };
    const keys = [
      "category_clarity",
      "usecase_saturation",
      "comparison_coverage",
      "entity_association",
      "authoritative_definition",
    ] as const;
    const out = {} as Record<(typeof keys)[number], number>;
    for (const k of keys) {
      const vals = merge
        .map((m) => m.scores?.[k])
        .filter((v): v is number => typeof v === "number");
      out[k] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    }
    return out;
  }, [scan]);

  const universal = issues.filter((i) => !i.model);
  const specific = issues.filter((i) => !!i.model);

  async function runAgent(agentId: AgentId, issueId?: string) {
    const res = await fetch(`/api/scans/${scanId}/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, issueId }),
    });
    const data = await res.json();
    if (data.content) setAgentOut(data.content);
    else setAgentOut(data.error ?? "Failed");
  }

  if (scan.status === "RUNNING") {
    return <ScanProgress scanId={scanId} />;
  }

  if (scan.status === "FAILED") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-8 text-center shadow-card">
        <p className="font-semibold text-rose-900">Scan failed</p>
        <p className="mt-2 text-sm text-rose-800/90">
          Check API keys and try again. Partial model failures are tolerated when keys are missing.
        </p>
      </div>
    );
  }

  const shownIssues = issueTab === "universal" ? universal : specific;

  return (
    <div className="space-y-12 pb-16">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/brands/${brandId}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-dark hover:underline"
          >
            ← {brandName}
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Diagnostic report
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">{scan.summary}</p>
        </div>
        <div className="flex shrink-0 justify-center lg:justify-end">
          <ScoreRing score={scan.crossModelScore ?? 0} label="Cross-model" />
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
          Model comparison
        </h2>
        <div className="mt-8">
          <ModelComparison
            scores={{
              claude: modelScores.claude ?? null,
              openai: modelScores.openai ?? null,
              perplexity: modelScores.perplexity ?? null,
              gemini: modelScores.gemini ?? null,
            }}
            failures={scan.modelFailures as Record<string, string> | null}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
          Signal strength (cross-model avg.)
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SignalBar label="Category clarity" value={avgSignals.category_clarity} />
          <SignalBar label="Use case saturation" value={avgSignals.usecase_saturation} />
          <SignalBar label="Comparison coverage" value={avgSignals.comparison_coverage} />
          <SignalBar label="Entity association" value={avgSignals.entity_association} />
          <SignalBar label="Authoritative definition" value={avgSignals.authoritative_definition} />
        </div>
      </section>

      {initial.plan?.tasks?.length ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
            30 / 60 / 90 plan
          </h2>
          <div className="mt-8">
            <PlanTimeline tasks={initial.plan.tasks} />
          </div>
        </section>
      ) : null}

      {scan.checklistRun ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
          <ChecklistView
            overallScore={scan.checklistRun.overallScore}
            items={scan.checklistRun.items}
          />
        </section>
      ) : null}

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
            Issues
          </h2>
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setIssueTab("universal")}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-semibold transition",
                issueTab === "universal"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Universal ({universal.length})
            </button>
            <button
              type="button"
              onClick={() => setIssueTab("specific")}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-semibold transition",
                issueTab === "specific"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Model-specific ({specific.length})
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {shownIssues.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-600">
              No issues in this view.
            </p>
          ) : (
            shownIssues.map((issue) => (
              <IssueCard
                key={issue.id + (issue.model ?? "")}
                issue={issue}
                onDeepDive={() => setDeepIssue(issue)}
                onAgent={(id) => runAgent(id as AgentId, issue.id)}
              />
            ))
          )}
        </div>
      </section>

      {deepIssue ? (
        <section className="rounded-2xl border border-brand/25 bg-gradient-to-b from-brand-muted/40 to-white p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-900">Deep analyze · {deepIssue.title}</h3>
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900"
              onClick={() => setDeepIssue(null)}
            >
              Close
            </button>
          </div>
          <div className="mt-6">
            <DeepDiveTabs scanId={scanId} issueId={deepIssue.id} />
          </div>
        </section>
      ) : null}

      {agentOut ? (
        <AgentCard title="Agent output">{agentOut}</AgentCard>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
          Roadmap — Phase 2+
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Deferred agents stay visible so you see the full roadmap. Upgrade when these ship.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {NON_MVP_AGENT_SUGGESTIONS.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <ChatSection scanId={scanId} />
      </section>
    </div>
  );
}
