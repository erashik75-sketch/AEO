"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";

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

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-brand focus:border-transparent focus:ring-2";

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="New brand"
        description="We use your URL and category to build probes and score how AI models describe you."
      />

      <form onSubmit={submit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Website URL *
            </label>
            <input
              required
              className={inputClass}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Brand name
            </label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Displayed in reports"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category *
            </label>
            <input
              required
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. SEO analytics, CRM for agencies"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Competitors
            </label>
            <input
              className={inputClass}
              value={form.competitors}
              onChange={(e) => setForm({ ...form, competitors: e.target.value })}
              placeholder="Comma-separated or short list"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Use cases
            </label>
            <textarea
              className={`${inputClass} min-h-[72px] resize-y`}
              rows={2}
              value={form.useCases}
              onChange={(e) => setForm({ ...form, useCases: e.target.value })}
              placeholder="How buyers describe what they need"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save brand"}
        </button>
      </form>
    </div>
  );
}
