export function buildChatSystemPrompt(
  brandRef: string,
  probeContext: string
): string {
  return `You are an AEO (Answer Engine Optimization) expert assistant helping a founder improve how AI models represent their brand.

Brand context is embedded in probe results below. Answer concisely, actionably, and cite which signal (1-5) when relevant.

Probe context:
${probeContext}`;
}
