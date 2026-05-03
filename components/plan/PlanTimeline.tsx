export function PlanTimeline({
  tasks,
}: {
  tasks: {
    id: string;
    title: string;
    phase: number;
    owner: string;
    status: string;
    signalImproved: string;
  }[];
}) {
  const grouped = [30, 60, 90].map((p) => ({
    phase: p,
    items: tasks.filter((t) => t.phase === p),
  }));

  const phaseTitle: Record<number, string> = {
    30: "Foundation",
    60: "Amplification",
    90: "Momentum",
  };

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      {grouped.map((g) => (
        <div key={g.phase}>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-muted text-sm font-bold text-brand-dark">
              {g.phase}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Day focus
              </p>
              <p className="font-semibold text-slate-900">{phaseTitle[g.phase]}</p>
            </div>
          </div>
          <ul className="space-y-3">
            {g.items.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm shadow-sm"
              >
                <div className="font-medium text-slate-900">{t.title}</div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="rounded-md bg-white px-2 py-0.5 font-medium text-slate-700 ring-1 ring-slate-200">
                    {t.owner}
                  </span>
                  <span>{t.signalImproved}</span>
                  <span className="capitalize">{t.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
