"use client";

import { useState } from "react";
import type { DeepDiveTab } from "@/lib/prompts/deepdive";
import { cn } from "@/lib/utils";

const tabs: { id: DeepDiveTab; label: string }[] = [
  { id: "why", label: "Why" },
  { id: "evidence", label: "Evidence" },
  { id: "fix", label: "Fix plan" },
  { id: "content", label: "Ready content" },
];

export function DeepDiveTabs({
  scanId,
  issueId,
}: {
  scanId: string;
  issueId: string;
}) {
  const [active, setActive] = useState<DeepDiveTab>("why");
  const [loaded, setLoaded] = useState<Partial<Record<DeepDiveTab, string>>>({});
  const [loading, setLoading] = useState<string | null>(null);

  async function load(tab: DeepDiveTab) {
    if (loaded[tab]) {
      setActive(tab);
      return;
    }
    setLoading(tab);
    const res = await fetch(`/api/scans/${scanId}/deepdive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId, tab }),
    });
    const data = await res.json();
    setLoaded((prev) => ({ ...prev, [tab]: data.content ?? "" }));
    setActive(tab);
    setLoading(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => load(t.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-semibold transition",
              active === t.id
                ? "bg-brand text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              loaded[t.id] && active !== t.id ? "ring-1 ring-brand/30" : ""
            )}
          >
            {t.label}
            {loaded[t.id] ? (
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ) : null}
          </button>
        ))}
      </div>
      <div className="min-h-[140px] whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50/80 p-5 text-sm leading-relaxed text-slate-800">
        {loading === active ? (
          <span className="animate-pulse text-slate-500">Generating…</span>
        ) : (
          loaded[active] ?? "Select a tab to load content."
        )}
      </div>
    </div>
  );
}
