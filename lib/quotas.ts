import { prisma } from "@/lib/prisma";
import { maxBrands, maxScansPerMonth } from "@/lib/plans";
import type { Plan } from "@prisma/client";

export async function ensureMonthlyScanReset(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const now = new Date();
  const reset = user.scansResetAt;
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  if (reset < monthAgo) {
    await prisma.user.update({
      where: { id: userId },
      data: { scansThisMonth: 0, scansResetAt: now },
    });
  }
}

export async function canCreateBrand(userId: string): Promise<boolean> {
  await ensureMonthlyScanReset(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { brands: true } } },
  });
  if (!user) return false;
  return user._count.brands < maxBrands(user.plan as Plan);
}

export async function canRunScan(userId: string): Promise<boolean> {
  await ensureMonthlyScanReset(userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  return user.scansThisMonth < maxScansPerMonth(user.plan as Plan);
}
