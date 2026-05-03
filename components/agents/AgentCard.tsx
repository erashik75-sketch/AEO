export function AgentCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
      <h4 className="font-semibold text-emerald-950">{title}</h4>
      {description ? (
        <p className="mt-1 text-sm text-emerald-900/80">{description}</p>
      ) : null}
      <div className="mt-3 whitespace-pre-wrap text-sm text-zinc-800">{children}</div>
    </div>
  );
}
