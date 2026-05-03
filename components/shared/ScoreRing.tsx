export function ScoreRing({
  score,
  label,
  size = 120,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const offset = c - (pct / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#18181b"
            strokeWidth="10"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold">{pct}</span>
        </div>
      </div>
      {label ? <span className="text-xs text-zinc-500">{label}</span> : null}
    </div>
  );
}
