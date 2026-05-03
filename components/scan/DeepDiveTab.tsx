"use client";

import { useState } from "react";
import type { DeepDiveTab } from "@/lib/prompts/deepdive";

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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => load(t.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              active === t.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {t.label}
            {loaded[t.id] ? " ●" : ""}
          </button>
        ))}
      </div>
      <div className="min-h-[120px] whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm text-zinc-800">
        {loading === active ? "Loading…" : loaded[active] ?? "Select a tab."}
      </div>
    </div>
  );
}
