import { SeverityBadge } from "@/components/shared/SeverityBadge";

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
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-zinc-900">{issue.title}</h3>
          <p className="mt-1 text-sm text-zinc-600">{issue.brief}</p>
          {issue.model ? (
            <p className="mt-1 text-xs text-zinc-500">Model: {issue.model}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1">
          <SeverityBadge severity={issue.severity} />
          <span className="text-xs text-zinc-500">Score {issue.score}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white"
          onClick={onDeepDive}
        >
          Deep analyze
        </button>
        <button
          type="button"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs"
          onClick={() => onAgent("canonical_definition")}
        >
          Canonical definition
        </button>
        <button
          type="button"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs"
          onClick={() => onAgent("semantic_keyword")}
        >
          Semantic keywords
        </button>
        <button
          type="button"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs"
          onClick={() => onAgent("technical_aeo")}
        >
          Technical AEO
        </button>
      </div>
    </div>
  );
}
