import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ received: true });
  }

  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !whSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (userId && customerId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId: customerId,
          plan: "PRO",
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
