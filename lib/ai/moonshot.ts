import OpenAI from "openai";

/** Moonshot Kimi — OpenAI-compatible API (default China endpoint). */
export async function callKimi(prompt: string): Promise<string> {
  if (!process.env.MOONSHOT_API_KEY) {
    throw new Error("MOONSHOT_API_KEY not configured (Kimi)");
  }
  const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_BASE_URL?.trim() || "https://api.moonshot.cn/v1",
  });
  const model = process.env.MOONSHOT_MODEL?.trim() || "moonshot-v1-8k";
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4096,
  });
  return response.choices[0]?.message?.content ?? "";
}
