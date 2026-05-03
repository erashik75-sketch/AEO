export function SignalBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex justify-between text-xs font-medium text-slate-600">
        <span className="leading-snug">{label}</span>
        <span className="tabular-nums text-slate-900">{v}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-500"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
