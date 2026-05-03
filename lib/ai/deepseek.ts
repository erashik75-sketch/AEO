import OpenAI from "openai";

/** DeepSeek — OpenAI-compatible API (https://api.deepseek.com). */
export async function callDeepSeek(prompt: string): Promise<string> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }
  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL:
      process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com/v1",
  });
  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4096,
  });
  return response.choices[0]?.message?.content ?? "";
}
