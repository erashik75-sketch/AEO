"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function ScanProgress({ scanId }: { scanId: string }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const probes = [
      "recognition",
      "category_rank",
      "usecase",
      "comparison",
      "entity",
      "outcomes",
      "definition",
    ];
    let i = 0;
    const tick = () => {
      if (i < probes.length) {
        setLines((l) => [...l, `✓ Probe ${probes[i]} complete`]);
        i += 1;
      } else {
        setDone(true);
        clearInterval(iv);
      }
    };
    const iv = setInterval(tick, 900);
    tick();
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const poll = setInterval(async () => {
      const res = await fetch(`/api/scans/${scanId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.scan?.status === "COMPLETE" || data.scan?.status === "FAILED") {
          setDone(true);
          window.location.reload();
        }
      }
    }, 4000);
    return () => clearInterval(poll);
  }, [scanId]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-4 font-mono text-sm text-green-400">
      <div className="mb-2 flex items-center gap-2 text-zinc-300">
        <Loader2 className={done ? "hidden" : "h-4 w-4 animate-spin"} />
        <span>Scan {scanId.slice(0, 8)}… {done ? "finalizing" : "running"}</span>
      </div>
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
}
