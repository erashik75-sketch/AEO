import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Marks first email as scheduled — wire Resend + Inngest in production. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { campaignId?: string };
  if (!body.campaignId) {
    return NextResponse.json({ error: "campaignId required" }, { status: 400 });
  }

  const campaign = await prisma.reviewCampaign.findFirst({
    where: {
      id: body.campaignId,
      brand: { userId: session.user.id },
    },
    include: { contacts: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  await prisma.reviewContact.updateMany({
    where: {
      campaignId: campaign.id,
      email1SentAt: null,
    },
    data: { email1SentAt: now },
  });

  return NextResponse.json({
    ok: true,
    message:
      "Sequence queued (integrate Resend + Inngest for production sends).",
    contactsUpdated: campaign.contacts.length,
  });
}
