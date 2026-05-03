import { Card } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <Card>
        <p className="text-zinc-700">
          Pro ($49/mo) and Agency ($149/mo) unlock all four models, full agent
          library, and scheduled re-scans. Wire{" "}
          <code className="rounded bg-zinc-100 px-1">STRIPE_SECRET_KEY</code>, price
          IDs, and{" "}
          <code className="rounded bg-zinc-100 px-1">POST /api/billing/checkout</code>{" "}
          to activate checkout.
        </p>
      </Card>
    </div>
  );
}
