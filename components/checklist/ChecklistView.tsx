export function ChecklistView({
  overallScore,
  items,
}: {
  overallScore: number;
  items: {
    id: string;
    checkId: string;
    name: string;
    status: string;
    aeoImpact: string;
    detail: string;
  }[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
            AEO health checklist
          </h3>
          <p className="mt-1 text-sm text-slate-600">Automated checks plus items you confirm manually.</p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tabular-nums tracking-tight text-slate-900">
            {overallScore}
          </span>
          <span className="text-sm font-medium text-slate-400">/ 100</span>
        </div>
      </div>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex flex-col gap-2 bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <span className="font-mono text-xs font-semibold text-brand-dark">{it.checkId}</span>
              <p className="mt-1 font-medium text-slate-900">{it.name}</p>
              <p className="mt-1 text-sm text-slate-600">{it.detail}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                  it.status === "pass"
                    ? "bg-emerald-100 text-emerald-800"
                    : it.status === "fail"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-900"
                }`}
              >
                {it.status}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {it.aeoImpact} impact
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
