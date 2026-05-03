import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe not configured. Set STRIPE_SECRET_KEY and price IDs to enable checkout.",
      },
      { status: 503 }
    );
  }

  const body = (await req.json()) as { priceId?: string };
  if (!body.priceId) {
    return NextResponse.json({ error: "priceId required" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: body.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/billing?success=1`,
    cancel_url: `${origin}/dashboard/billing?canceled=1`,
    customer_email: session.user.email ?? undefined,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkout.url });
}
