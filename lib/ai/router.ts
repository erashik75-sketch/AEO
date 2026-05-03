import type { AIModel } from "@/types";
import { callClaude } from "./anthropic";
import { callGemini } from "./gemini";
import { callOpenAI } from "./openai";
import { callPerplexity } from "./perplexity";

export async function callModel(model: AIModel, query: string): Promise<string> {
  switch (model) {
    case "claude":
      return callClaude(query);
    case "openai":
      return callOpenAI(query);
    case "perplexity":
      return callPerplexity(query);
    case "gemini":
      return callGemini(query);
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}

export async function runProbeAcrossModels(
  query: string,
  models: AIModel[]
): Promise<{ results: Partial<Record<AIModel, string>>; failures: Partial<Record<AIModel, string>> }> {
  const results: Partial<Record<AIModel, string>> = {};
  const failures: Partial<Record<AIModel, string>> = {};

  await Promise.all(
    models.map(async (model) => {
      try {
        results[model] = await callModel(model, query);
      } catch (e) {
        failures[model] = e instanceof Error ? e.message : String(e);
      }
    })
  );

  return { results, failures };
}
