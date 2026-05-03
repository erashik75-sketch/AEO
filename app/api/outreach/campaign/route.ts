import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    brandId?: string;
    platform?: "g2" | "capterra";
  };

  if (!body.brandId || !body.platform) {
    return NextResponse.json({ error: "brandId and platform required" }, { status: 400 });
  }

  const brand = await prisma.brand.findFirst({
    where: { id: body.brandId, userId: session.user.id },
  });
  if (!brand) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const campaign = await prisma.reviewCampaign.create({
    data: {
      brandId: brand.id,
      platform: body.platform,
      status: "active",
    },
  });

  return NextResponse.json(campaign);
}
