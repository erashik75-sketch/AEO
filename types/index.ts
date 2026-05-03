export type AIModel = "claude" | "openai" | "perplexity" | "gemini";

export interface SignalScores {
  category_clarity: number;
  usecase_saturation: number;
  comparison_coverage: number;
  entity_association: number;
  authoritative_definition: number;
}

export interface Issue {
  id: string;
  signal: number;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  brief: string;
  score: number;
  model?: AIModel;
}

export interface ModelScores {
  summary: string;
  scores: SignalScores;
  overall: number;
  issues: Issue[];
  modelSpecificInsight?: string;
}

export interface SynthesisResult {
  crossModelScore: number;
  worstModel: AIModel;
  bestModel: AIModel;
  universalIssues: Issue[];
  modelSpecificIssues: Issue[];
  synthesizedSummary: string;
}

export interface BrandContext {
  url: string;
  brandRef: string;
  category: string;
  competitors?: string | null;
  useCases?: string | null;
}

export interface AgentSuggestion {
  id: string;
  name: string;
  phase: "phase2" | "phase3";
  tagline: string;
  signalFixed: string[];
  estimatedImpact: "high" | "medium" | "low";
  whyNotMVP: string;
  prerequisite: string;
  cta: "coming_soon" | "request_early_access";
}
