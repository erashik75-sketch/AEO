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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cells.map((c) => {
        const fail = failures?.[c.key];
        const v = typeof c.value === "number" ? c.value : fail ? null : null;
        return (
          <div
            key={c.key}
            className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-4"
          >
            <span className="mb-2 text-sm font-medium text-zinc-600">{c.label}</span>
            {fail ? (
              <span className="text-xs text-red-600">Failed: {fail.slice(0, 80)}</span>
            ) : v != null ? (
              <ScoreRing score={v} size={100} />
            ) : (
              <span className="text-sm text-zinc-400">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
