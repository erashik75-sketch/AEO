import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

export async function callOpenAI(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
  });
  return response.choices[0]?.message?.content ?? "";
}
