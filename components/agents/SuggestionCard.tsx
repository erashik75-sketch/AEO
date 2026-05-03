import type { AgentSuggestion } from "@/types";

export function SuggestionCard({ suggestion }: { suggestion: AgentSuggestion }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 opacity-80">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-zinc-700">{suggestion.name}</h4>
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs">
          {suggestion.phase === "phase2" ? "Phase 2" : "Phase 3"}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-600">{suggestion.tagline}</p>
      <p className="mt-2 text-xs text-zinc-500">
        Signals: {suggestion.signalFixed.join(", ")} · Impact:{" "}
        {suggestion.estimatedImpact}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{suggestion.prerequisite}</p>
      <button
        type="button"
        disabled
        className="mt-3 rounded-lg bg-zinc-200 px-3 py-1.5 text-xs text-zinc-500"
      >
        {suggestion.cta === "coming_soon" ? "Coming soon" : "Request early access"}
      </button>
    </div>
  );
}
