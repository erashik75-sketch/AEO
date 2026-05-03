"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    url: "",
    name: "",
    category: "",
    competitors: "",
    description: "",
    useCases: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      const b = await res.json();
      router.push(`/dashboard/brands/${b.id}`);
    } else {
      const err = await res.json();
      alert(err.error ?? "Could not create brand");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold">New brand</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Website URL *</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Brand name</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Category *</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. SEO analytics"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Competitors</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={form.competitors}
            onChange={(e) => setForm({ ...form, competitors: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Use cases</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            rows={2}
            value={form.useCases}
            onChange={(e) => setForm({ ...form, useCases: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save brand"}
        </button>
      </form>
    </div>
  );
}
