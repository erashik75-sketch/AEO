import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { Sparkles } from "lucide-react";

export function IssueCard({
  issue,
  onDeepDive,
  onAgent,
}: {
  issue: {
    id: string;
    title: string;
    brief: string;
    severity: string;
    score: number;
    signal?: number;
    model?: string;
  };
  onDeepDive: () => void;
  onAgent: (agent: string) => void;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card transition hover:border-brand/20 hover:shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{issue.title}</h3>
            {issue.signal ? (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                Signal {issue.signal}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{issue.brief}</p>
          {issue.model ? (
            <p className="mt-2 text-xs font-medium text-brand-dark">Model: {issue.model}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <SeverityBadge severity={issue.severity} />
          <span className="text-xs font-medium tabular-nums text-slate-500">Score {issue.score}</span>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          onClick={onDeepDive}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Deep analyze
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand/30 hover:bg-brand-muted/50"
          onClick={() => onAgent("canonical_definition")}
        >
          Canonical definition
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand/30 hover:bg-brand-muted/50"
          onClick={() => onAgent("semantic_keyword")}
        >
          Semantic keywords
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand/30 hover:bg-brand-muted/50"
          onClick={() => onAgent("technical_aeo")}
        >
          Technical AEO
        </button>
      </div>
    </div>
  );
}
