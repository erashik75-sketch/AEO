import type { AgentSuggestion } from "@/types";
import { Lock } from "lucide-react";

export function SuggestionCard({ suggestion }: { suggestion: AgentSuggestion }) {
  return (
    <div className="group relative rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/90 p-5 transition hover:border-slate-400">
      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-slate-200/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
        <Lock className="h-3 w-3" />
        {suggestion.phase === "phase2" ? "Phase 2" : "Phase 3"}
      </div>
      <h4 className="pr-24 font-semibold text-slate-700">{suggestion.name}</h4>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{suggestion.tagline}</p>
      <p className="mt-3 text-xs text-slate-500">
        <span className="font-medium text-slate-700">Signals:</span>{" "}
        {suggestion.signalFixed.join(", ")}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        <span className="font-medium text-slate-700">Impact:</span> {suggestion.estimatedImpact}
      </p>
      <p className="mt-2 text-xs italic text-slate-500">{suggestion.prerequisite}</p>
      <button
        type="button"
        disabled
        className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-400"
      >
        {suggestion.cta === "coming_soon" ? "Coming soon" : "Request early access"}
      </button>
    </div>
  );
}
