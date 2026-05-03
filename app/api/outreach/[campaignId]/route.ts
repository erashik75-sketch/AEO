import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ campaignId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { campaignId } = await ctx.params;

  const campaign = await prisma.reviewCampaign.findFirst({
    where: {
      id: campaignId,
      brand: { userId: session.user.id },
    },
    include: { contacts: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(campaign);
}
