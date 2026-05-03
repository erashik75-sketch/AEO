import type { Issue, ModelScores } from "@/types";

export function buildAnalysisPrompt(
  brandRef: string,
  url: string,
  category: string,
  probeContext: string,
  modelName: string
): string {
  return `You are an AEO expert analyzing how well ${brandRef} (${url}) is represented in ${modelName}'s training data.

Probe results from ${modelName}:
${probeContext}

Return ONLY valid JSON, no markdown:
{
  "summary": "2 sentences on AEO health for ${brandRef} specifically in ${modelName}",
  "scores": {
    "category_clarity": <0-100>,
    "usecase_saturation": <0-100>,
    "comparison_coverage": <0-100>,
    "entity_association": <0-100>,
    "authoritative_definition": <0-100>
  },
  "overall": <0-100>,
  "issues": [
    {
      "id": "unique_id",
      "signal": <1-5>,
      "title": "Issue title max 8 words",
      "severity": "critical|high|medium|low",
      "brief": "1 sentence: what specifically is missing based on ${modelName}'s responses",
      "score": <0-100>
    }
  ],
  "modelSpecificInsight": "1 sentence on something specific to how ${modelName} represents or misrepresents this brand that differs from a generic AI"
}

Score based on actual probe evidence. Brand unknown to AI = 10-30. Return 3-5 issues.`;
}

export function buildSynthesisPrompt(
  brandRef: string,
  category: string,
  modelScores: Record<string, ModelScores>
): string {
  return `You are synthesizing AEO diagnostic results across AI models for ${brandRef} (${category}).

Model results:
${Object.entries(modelScores)
  .map(
    ([model, scores]) =>
      `${model.toUpperCase()}: overall=${scores.overall}, issues=${JSON.stringify(scores.issues)}`
  )
  .join("\n")}

Return ONLY valid JSON:
{
  "crossModelScore": <0-100 average>,
  "worstModel": "claude|openai|perplexity|gemini",
  "bestModel": "claude|openai|perplexity|gemini",
  "universalIssues": [],
  "modelSpecificIssues": [],
  "synthesizedSummary": "3 sentences: overall AEO health, biggest universal gap, biggest model-specific gap"
}

Use the same issue shape as input issues: id, signal (number 1-5), title, severity, brief, score. For modelSpecificIssues include a "model" field with the model name.`;
}

export function buildPlanPrompt(params: {
  brand: string;
  category: string;
  crossModelScore: number;
  modelScores: Record<string, number>;
  issues: Issue[];
  checklistFailures: { name: string; aeoImpact: string }[];
  competitors: string;
}): string {
  return `You are a senior AEO strategist generating a personalized execution plan.

Brand: ${params.brand} | Category: ${params.category}
Cross-model AEO score: ${params.crossModelScore}/100
Per-model scores: ${JSON.stringify(params.modelScores)}
Critical issues: ${params.issues.filter((i) => i.severity === "critical").map((i) => i.title).join(", ")}
Failed checklist items: ${params.checklistFailures.filter((i) => i.aeoImpact !== "low").map((i) => i.name).join(", ")}

Generate a 30/60/90 day AEO plan.

Return ONLY valid JSON:
{
  "priorityAction": { "title": "", "whyFirst": "", "steps": ["",""] },
  "phase30": { "focus": "", "tasks": [{ "title": "", "owner": "founder|dev|writer|agent", "estimate": "", "signalImproved": "", "agentId": "" }] },
  "phase60": { "focus": "", "tasks": [] },
  "phase90": { "focus": "", "tasks": [] },
  "modelPriority": "",
  "dependencyOrder": [""]
}`;
}
