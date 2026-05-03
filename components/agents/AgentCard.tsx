import type { ReactNode } from "react";

export function AgentCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white p-6 shadow-card">
      <h4 className="font-semibold text-emerald-950">{title}</h4>
      {description ? (
        <p className="mt-1 text-sm text-emerald-900/75">{description}</p>
      ) : null}
      <div className="mt-4 max-h-[480px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-emerald-100/80 bg-white/90 p-4 text-sm leading-relaxed text-slate-800">
        {children}
      </div>
    </div>
  );
}
