import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

/** Claude Sonnet — primary analysis model per spec (claude-sonnet-4-5 when available). */
export async function callClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "[Claude unavailable: missing ANTHROPIC_API_KEY]";
  }
  const model =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";
  const msg = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  const block = msg.content[0];
  if (block.type === "text") return block.text;
  return "";
}
