import { GoogleGenerativeAI } from "@google/generative-ai";

export async function callGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName =
    process.env.GEMINI_MODEL?.trim() || "gemini-1.5-pro";
  const model = client.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
