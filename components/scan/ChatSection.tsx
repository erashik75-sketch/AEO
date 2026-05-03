"use client";

import { useEffect, useState } from "react";

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
    <div className="space-y-3">
      <h3 className="font-semibold">Ask the AEO expert</h3>
      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-3 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <span className="inline-block rounded-lg bg-zinc-100 px-3 py-2 text-left">
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What should we fix first?"
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          type="button"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          disabled={sending}
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  );
}
