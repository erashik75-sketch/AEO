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

  return (
    <div className="space-y-6">
      {grouped.map((g) => (
        <div key={g.phase}>
          <h4 className="mb-2 font-semibold text-zinc-900">{g.phase} days</h4>
          <ul className="space-y-2">
            {g.items.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-zinc-200 bg-white p-3 text-sm"
              >
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-zinc-500">
                  {t.owner} · {t.signalImproved} · {t.status}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
