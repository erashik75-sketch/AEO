import { ScoreRing } from "@/components/shared/ScoreRing";

export function ModelComparison({
  scores,
  failures,
}: {
  scores: {
    claude?: number | null;
    openai?: number | null;
    perplexity?: number | null;
    gemini?: number | null;
  };
  failures?: Record<string, string> | null;
}) {
  const cells = [
    { key: "claude", label: "Claude", value: scores.claude },
    { key: "openai", label: "ChatGPT", value: scores.openai },
    { key: "perplexity", label: "Perplexity", value: scores.perplexity },
    { key: "gemini", label: "Gemini", value: scores.gemini },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cells.map((c) => {
        const fail = failures?.[c.key];
        const v = typeof c.value === "number" ? c.value : null;

        return (
          <div
            key={c.key}
            className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <span className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {c.label}
            </span>
            {fail ? (
              <p className="max-w-[140px] text-center text-xs leading-relaxed text-rose-700">
                Failed
                <span className="mt-1 block font-mono text-[10px] text-rose-600/90">
                  {fail.slice(0, 100)}
                  {fail.length > 100 ? "…" : ""}
                </span>
              </p>
            ) : v != null ? (
              <ScoreRing score={v} size={104} />
            ) : (
              <span className="rounded-xl bg-slate-50 px-6 py-10 text-sm font-medium text-slate-400">
                —
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
