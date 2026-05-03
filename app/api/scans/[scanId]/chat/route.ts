import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildChatSystemPrompt } from "@/lib/prompts/chat";
import { callClaude } from "@/lib/ai/anthropic";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ scanId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scanId } = await ctx.params;
  const body = (await req.json()) as { message: string };

  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      brand: { userId: session.user.id },
    },
    include: { brand: true },
  });

  if (!scan || scan.status !== "COMPLETE") {
    return NextResponse.json({ error: "Scan not ready" }, { status: 400 });
  }

  const brandRef = scan.brand.name ?? new URL(scan.brand.url).hostname;
  const system = buildChatSystemPrompt(brandRef, scan.probeContext ?? "");

  await prisma.chatMessage.create({
    data: {
      scanId,
      role: "user",
      content: body.message,
    },
  });

  const history = await prisma.chatMessage.findMany({
    where: { scanId },
    orderBy: { createdAt: "asc" },
    take: 30,
  });

  const dialog = history
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const reply = await callClaude(
    `${system}\n\nConversation:\n${dialog}\n\nAssistant (concise, actionable):`
  );

  await prisma.chatMessage.create({
    data: {
      scanId,
      role: "assistant",
      content: reply,
    },
  });

  return NextResponse.json({ reply });
}
