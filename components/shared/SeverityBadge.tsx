import { cn } from "@/lib/utils";

export function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const styles: Record<string, string> = {
    critical: "bg-rose-100 text-rose-900 ring-1 ring-rose-200",
    high: "bg-orange-100 text-orange-900 ring-1 ring-orange-200",
    medium: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
    low: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        styles[severity] ?? styles.low
      )}
    >
      {severity}
    </span>
  );
}
