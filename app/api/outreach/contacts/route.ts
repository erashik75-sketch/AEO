import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    campaignId?: string;
    contacts?: { email: string; name?: string; tier?: number }[];
  };

  if (!body.campaignId || !body.contacts?.length) {
    return NextResponse.json(
      { error: "campaignId and contacts required" },
      { status: 400 }
    );
  }

  const campaign = await prisma.reviewCampaign.findFirst({
    where: {
      id: body.campaignId,
      brand: { userId: session.user.id },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.reviewContact.createMany({
    data: body.contacts.map((c, i) => ({
      campaignId: campaign.id,
      email: c.email,
      name: c.name,
      tier: c.tier ?? i % 3,
    })),
    skipDuplicates: true,
  });

  const updated = await prisma.reviewCampaign.findUnique({
    where: { id: campaign.id },
    include: { contacts: true },
  });

  return NextResponse.json(updated);
}
