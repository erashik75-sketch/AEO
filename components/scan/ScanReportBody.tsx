"use client";

import { useMemo, useState } from "react";
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
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        Scan failed. Try again or check API keys.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            <a href={`/dashboard/brands/${brandId}`} className="hover:underline">
              ← {brandName}
            </a>
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Diagnostic report</h1>
          <p className="mt-2 max-w-2xl text-zinc-600">{scan.summary}</p>
        </div>
        <ScoreRing score={scan.crossModelScore ?? 0} label="Cross-model" />
      </div>

      <section>
        <h2 className="mb-4 font-semibold">Model comparison</h2>
        <ModelComparison
          scores={{
            claude: modelScores.claude ?? null,
            openai: modelScores.openai ?? null,
            perplexity: modelScores.perplexity ?? null,
            gemini: modelScores.gemini ?? null,
          }}
          failures={scan.modelFailures as Record<string, string> | null}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <SignalBar label="Category clarity" value={avgSignals.category_clarity} />
        <SignalBar label="Use case saturation" value={avgSignals.usecase_saturation} />
        <SignalBar label="Comparison coverage" value={avgSignals.comparison_coverage} />
        <SignalBar label="Entity association" value={avgSignals.entity_association} />
        <SignalBar label="Authoritative definition" value={avgSignals.authoritative_definition} />
      </section>

      {initial.plan?.tasks?.length ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold">30 / 60 / 90 plan</h2>
          <PlanTimeline tasks={initial.plan.tasks} />
        </section>
      ) : null}

      {scan.checklistRun ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <ChecklistView
            overallScore={scan.checklistRun.overallScore}
            items={scan.checklistRun.items}
          />
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 font-semibold">Issues</h2>
        <div className="space-y-4">
          {universal.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onDeepDive={() => setDeepIssue(issue)}
              onAgent={(id) => runAgent(id as AgentId, issue.id)}
            />
          ))}
        </div>
        {specific.length > 0 ? (
          <>
            <h3 className="mb-3 mt-8 text-sm font-semibold uppercase text-zinc-500">
              Model-specific
            </h3>
            <div className="space-y-4">
              {specific.map((issue) => (
                <IssueCard
                  key={issue.id + (issue.model ?? "")}
                  issue={issue}
                  onDeepDive={() => setDeepIssue(issue)}
                  onAgent={(id) => runAgent(id as AgentId, issue.id)}
                />
              ))}
            </div>
          </>
        ) : null}
      </section>

      {deepIssue ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h3 className="font-semibold">Deep analyze: {deepIssue.title}</h3>
          <div className="mt-4">
            <DeepDiveTabs scanId={scanId} issueId={deepIssue.id} />
          </div>
          <button
            type="button"
            className="mt-4 text-sm text-zinc-500 underline"
            onClick={() => setDeepIssue(null)}
          >
            Close
          </button>
        </section>
      ) : null}

      {agentOut ? (
        <AgentCard title="Agent output">
          {agentOut}
        </AgentCard>
      ) : null}

      <section>
        <h2 className="mb-4 font-semibold text-zinc-500">Roadmap (Phase 2+)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {NON_MVP_AGENT_SUGGESTIONS.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <ChatSection scanId={scanId} />
      </section>
    </div>
  );
}
