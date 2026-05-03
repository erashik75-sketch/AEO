import { callClaude } from "./anthropic";
import { callDeepSeek } from "./deepseek";
import { callKimi } from "./moonshot";

export type LlmProviderId = "claude" | "deepseek" | "kimi";

function normalizeProvider(raw: string | undefined, fallback: LlmProviderId): LlmProviderId {
  const p = (raw ?? "").toLowerCase().trim();
  if (p === "deepseek") return "deepseek";
  if (p === "kimi" || p === "moonshot") return "kimi";
  return fallback;
}

/** Which backend runs MVP fix agents (`lib/agents/runner.ts`). */
export function getAgentLlmProvider(): LlmProviderId {
  return normalizeProvider(process.env.AGENT_LLM_PROVIDER, "claude");
}

/** Which backend runs scan analysis, plans, chat, deep dives (orchestrator + API routes). */
export function getAnalysisLlmProvider(): LlmProviderId {
  return normalizeProvider(
    process.env.ANALYSIS_LLM_PROVIDER ?? process.env.AGENT_LLM_PROVIDER,
    "claude"
  );
}

export async function callWithProvider(
  provider: LlmProviderId,
  prompt: string
): Promise<string> {
  switch (provider) {
    case "deepseek":
      return callDeepSeek(prompt);
    case "kimi":
      return callKimi(prompt);
    default:
      return callClaude(prompt);
  }
}

/** Use for agents — respects `AGENT_LLM_PROVIDER`. */
export async function callAgentLlm(prompt: string): Promise<string> {
  return callWithProvider(getAgentLlmProvider(), prompt);
}

/** Use for scans / synthesis / plans / chat — respects `ANALYSIS_LLM_PROVIDER` (defaults to same as agents if unset). */
export async function callAnalysisLlm(prompt: string): Promise<string> {
  return callWithProvider(getAnalysisLlmProvider(), prompt);
}
