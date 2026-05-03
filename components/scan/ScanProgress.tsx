"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ScanProgress({ scanId }: { scanId: string }) {
  const lines = [
    "Bootstrapping probes…",
    "Recognition & category rank…",
    "Use case & comparison…",
    "Entity & outcomes…",
    "Canonical definition probe…",
    "Scoring per model…",
    "Synthesizing issues…",
  ];

  useEffect(() => {
    const poll = setInterval(async () => {
      const res = await fetch(`/api/scans/${scanId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.scan?.status === "COMPLETE" || data.scan?.status === "FAILED") {
          window.location.reload();
        }
      }
    }, 3500);
    return () => clearInterval(poll);
  }, [scanId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-card">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand" />
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-wider text-emerald-400/90">
            Scan in progress
          </p>
          <p className="font-mono text-[11px] text-slate-500">{scanId.slice(0, 12)}…</p>
        </div>
      </div>
      <div className="space-y-2 p-5 font-mono text-xs leading-relaxed text-emerald-400/95">
        {lines.map((l) => (
          <div key={l} className="flex gap-2">
            <span className="text-emerald-600">›</span>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
