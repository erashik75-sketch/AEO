export function ScoreRing({
  score,
  label,
  size = 120,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const offset = c - (pct / 100) * c;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 drop-shadow-sm">
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth="12"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums tracking-tight text-slate-900">
            {pct}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            AEO
          </span>
        </div>
      </div>
      {label ? (
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      ) : null}
    </div>
  );
}
