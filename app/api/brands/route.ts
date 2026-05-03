import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brands = await prisma.brand.findMany({
    where: { userId: session.user.id },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          crossModelScore: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { scansThisMonth: true, plan: true },
  });

  return NextResponse.json({ brands, scansUsed: user?.scansThisMonth ?? 0, plan: user?.plan });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    url: string;
    name?: string;
    category: string;
    competitors?: string;
    description?: string;
    useCases?: string;
  };

  const { canCreateBrand } = await import("@/lib/quotas");
  if (!(await canCreateBrand(session.user.id))) {
    return NextResponse.json(
      { error: "Brand limit reached for your plan." },
      { status: 403 }
    );
  }

  let normalizedUrl = body.url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const brand = await prisma.brand.create({
    data: {
      userId: session.user.id,
      url: normalizedUrl,
      name: body.name,
      category: body.category,
      competitors: body.competitors,
      description: body.description,
      useCases: body.useCases,
    },
  });

  return NextResponse.json(brand);
}
