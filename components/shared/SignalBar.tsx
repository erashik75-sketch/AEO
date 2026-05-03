export function SignalBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-600">
        <span>{label}</span>
        <span>{v}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
