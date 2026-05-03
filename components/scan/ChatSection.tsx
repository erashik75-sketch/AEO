"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

export function ChatSection({ scanId }: { scanId: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/scans/${scanId}`);
      if (!res.ok) return;
      const data = await res.json();
      const ms = data.scan?.chatMessages ?? [];
      setMessages(
        ms.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        }))
      );
    }
    load();
  }, [scanId]);

  async function send() {
    if (!input.trim()) return;
    setSending(true);
    const message = input;
    setInput("");
    await fetch(`/api/scans/${scanId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const res = await fetch(`/api/scans/${scanId}`);
    const data = await res.json();
    const ms = data.scan?.chatMessages ?? [];
    setMessages(
      ms.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }))
    );
    setSending(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-muted text-brand-dark">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-semibold text-slate-900">Ask the AEO expert</h3>
          <p className="text-xs text-slate-500">Grounded in your probe context for this scan.</p>
        </div>
      </div>
      <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">Ask anything about this diagnostic.</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-800 shadow-sm"
                }`}
              >
                {m.content}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-3">
        <input
          className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none ring-brand focus:border-transparent focus:ring-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What should we prioritize next?"
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
        />
        <button
          type="button"
          className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-45"
          disabled={sending}
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  );
}
