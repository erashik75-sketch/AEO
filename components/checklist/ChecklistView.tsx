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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">AEO health checklist</h3>
        <span className="text-2xl font-bold">{overallScore}</span>
      </div>
      <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200">
        {items.map((it) => (
          <div key={it.id} className="flex flex-col gap-1 p-3 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <span className="font-medium">{it.checkId}</span> — {it.name}
              <p className="text-xs text-zinc-500">{it.detail}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                  it.status === "pass"
                    ? "bg-green-100 text-green-800"
                    : it.status === "fail"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-900"
                }`}
              >
                {it.status}
              </span>
              <span className="text-xs text-zinc-500">{it.aeoImpact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
