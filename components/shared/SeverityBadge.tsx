import { cn } from "@/lib/utils";

export function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-900",
    high: "bg-orange-100 text-orange-900",
    medium: "bg-amber-100 text-amber-900",
    low: "bg-zinc-100 text-zinc-700",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        colors[severity] ?? colors.low
      )}
    >
      {severity}
    </span>
  );
}
