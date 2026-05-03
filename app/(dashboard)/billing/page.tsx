import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Billing"
        description="Upgrade to unlock all four models, every MVP agent, scheduled re-scans, and higher limits."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            name: "Free",
            price: "$0",
            features: ["1 brand", "2 scans/mo", "Claude probes only", "3 agents"],
          },
          {
            name: "Pro",
            price: "$49/mo",
            highlight: true,
            features: ["5 brands", "15 scans/mo", "All 4 models", "All 9 agents", "50 outreach contacts"],
          },
          {
            name: "Agency",
            price: "$149/mo",
            features: ["Unlimited brands", "Unlimited scans", "Team seats", "Full outreach"],
          },
        ].map((tier) => (
          <Card
            key={tier.name}
            className={`relative flex flex-col p-6 ${
              tier.highlight
                ? "border-brand/40 bg-gradient-to-b from-brand-muted/80 to-white ring-2 ring-brand/20"
                : ""
            }`}
          >
            {tier.highlight ? (
              <span className="absolute right-4 top-4 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Popular
              </span>
            ) : null}
            <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{tier.price}</p>
            <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-slate-600">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={tier.name === "Free"}
              className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold ${
                tier.highlight
                  ? "bg-brand text-white shadow-md hover:bg-brand-dark"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {tier.name === "Free" ? "Current" : "Coming soon"}
            </button>
          </Card>
        ))}
      </div>
      <Card className="mt-10 border-slate-200 bg-slate-50/80 p-6">
        <p className="text-sm leading-relaxed text-slate-700">
          Wire{" "}
          <code className="rounded-md bg-white px-1.5 py-0.5 text-xs ring-1 ring-slate-200">
            STRIPE_SECRET_KEY
          </code>{" "}
          and price IDs, then use{" "}
          <code className="rounded-md bg-white px-1.5 py-0.5 text-xs ring-1 ring-slate-200">
            POST /api/billing/checkout
          </code>{" "}
          to activate Stripe Checkout. Customer portal is available at{" "}
          <code className="rounded-md bg-white px-1.5 py-0.5 text-xs ring-1 ring-slate-200">
            /api/billing/portal
          </code>
          .
        </p>
      </Card>
    </div>
  );
}
