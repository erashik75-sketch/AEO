import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canRunScan } from "@/lib/quotas";
import { executeScan } from "@/lib/scan/orchestrator";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { brandId?: string };
  if (!body.brandId) {
    return NextResponse.json({ error: "brandId required" }, { status: 400 });
  }

  if (!(await canRunScan(session.user.id))) {
    return NextResponse.json(
      { error: "Monthly scan limit reached." },
      { status: 403 }
    );
  }

  const brand = await prisma.brand.findFirst({
    where: { id: body.brandId, userId: session.user.id },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const scan = await prisma.scan.create({
    data: {
      brandId: brand.id,
      status: "RUNNING",
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { scansThisMonth: { increment: 1 } },
  });

  executeScan(scan.id).catch(async (e) => {
    console.error(e);
    await prisma.scan.update({
      where: { id: scan.id },
      data: { status: "FAILED", summary: String(e) },
    });
  });

  return NextResponse.json({ scanId: scan.id });
}
