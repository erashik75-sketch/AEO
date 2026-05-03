import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Authentication and integrations are configured via environment variables on the server."
      />
      <Card className="space-y-6 p-6">
        <section>
          <h2 className="text-sm font-semibold text-slate-900">Authentication</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Set{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">AUTH_SECRET</code>,{" "}
            optional{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              AUTH_GOOGLE_ID
            </code>{" "}
            /{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              AUTH_GOOGLE_SECRET
            </code>
            , or SMTP for magic links. In development, use the dev email provider on the
            login page.
          </p>
        </section>
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-sm font-semibold text-slate-900">AI & data</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">DATABASE_URL</code>{" "}
            for Postgres (e.g. Supabase),{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              ANTHROPIC_API_KEY
            </code>{" "}
            for core scans, and optional keys for OpenAI, Perplexity, and Gemini for
            multi-model tiers.
          </p>
        </section>
      </Card>
    </div>
  );
}
