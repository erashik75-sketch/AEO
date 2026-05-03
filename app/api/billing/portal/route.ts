import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured." },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer on file." },
      { status: 400 }
    );
  }

  const origin = new URL(req.url).origin;

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/dashboard/billing`,
  });

  return NextResponse.json({ url: portal.url });
}
