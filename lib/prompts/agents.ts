export function buildCanonicalDefinitionPrompt(params: {
  brand: string;
  category: string;
  targetBuyer: string;
  coreProblem: string;
  keyFeatures: string;
  coreOutcome: string;
  probeContext: string;
}): string {
  return `You are building the canonical brand definition for ${params.brand}.

Based on probe results showing how AI currently describes this brand:
${params.probeContext}

Generate 7 platform-specific versions of the canonical definition. Each version must:
- Name the exact product category
- Name the buyer by job title: ${params.targetBuyer}
- State the core problem: ${params.coreProblem}
- Reference key features: ${params.keyFeatures}
- Name the outcome: ${params.coreOutcome}

Platforms:

1. HOMEPAGE HERO (25 words max)
2. META DESCRIPTION (155 chars max)
3. G2 PROFILE DESCRIPTION (100 words)
4. CRUNCHBASE SHORT DESCRIPTION (50 words)
5. LINKEDIN COMPANY ABOUT (120 words)
6. TWITTER/X BIO (160 chars)
7. PRODUCT HUNT TAGLINE (60 chars) + SHORT DESCRIPTION (260 chars)

After all 7, list CORE SEMANTIC KEYWORDS that appear across all versions.`;
}

export function buildSemanticKeywordPrompt(params: {
  brand: string;
  category: string;
  probeContext: string;
  websiteCopy: string;
}): string {
  return `You are building the AEO semantic keyword map for ${params.brand} (${params.category}).

What the AI currently says:
${params.probeContext}

Current website copy:
${params.websiteCopy}

PART 1 — KEYWORD MAP (Clusters A-D with phrases and gaps)
PART 2 — PAGE-BY-PAGE GAP REPORT
PART 3 — USAGE RULES`;
}

export function buildConsistencyAuditPrompt(params: {
  brand: string;
  category: string;
  canonicalDefinition: string;
  platformContent: Record<string, string>;
}): string {
  return `You are auditing brand consistency for ${params.brand} across platforms.

Canonical definition:
${params.canonicalDefinition}

Platform content:
${Object.entries(params.platformContent)
  .map(([k, v]) => `${k.toUpperCase()}:\n${v}`)
  .join("\n\n")}

Provide per-platform assessment and COPY-PASTE CORRECTIONS table.`;
}

export function buildRedditPostPrompt(params: {
  brand: string;
  category: string;
  subreddit: string;
  subredditCulture: string;
  issueTitle: string;
  semanticKeywords: string[];
  probeContext: string;
}): string {
  return `Write an authentic Reddit post for r/${params.subreddit} for ${params.brand}'s founder.

Culture: ${params.subredditCulture}
Issue: ${params.issueTitle}
Keywords: ${params.semanticKeywords.join(", ")}

Probe context:
${params.probeContext}

Include TITLE options, BODY, PURE VALUE VERSION, COMMENT STRATEGY.`;
}

export function buildIndieHackersPostPrompt(params: {
  brand: string;
  category: string;
  milestone: string;
  semanticKeywords: string[];
  founderVoice: string;
}): string {
  return `Write an Indie Hackers post for ${params.brand}. Milestone: ${params.milestone}. Keywords: ${params.semanticKeywords.join(", ")}. Voice: ${params.founderVoice}.`;
}

export function buildExampleReviewPrompt(params: {
  brand: string;
  category: string;
  targetPersona: string;
  semanticKeywords: string[];
}): string {
  return `Write a realistic 80-word G2-style review for ${params.brand} as a ${params.targetPersona}. Use terms: ${params.semanticKeywords.slice(0, 6).join(", ")}.`;
}

export function buildTechnicalAuditPrompt(params: {
  brand: string;
  url: string;
  crawlResults: Record<string, unknown>;
  probeContext: string;
}): string {
  return `Technical AEO audit for ${params.brand} (${params.url}).

Crawl results:
${JSON.stringify(params.crawlResults, null, 2)}

Probe context:
${params.probeContext}

List issues with severity, fix, code snippets where applicable, priority order.`;
}

export function buildReprobePrompt(
  brand: string,
  category: string,
  modelName: string
): string {
  return `Run a targeted re-probe of ${brand} in ${modelName} for category ${category}. Compare to prior scan conceptually; return improved guidance and remaining gaps.`;
}

export function buildDiffPrompt(params: {
  brand: string;
  category: string;
  previousProbes: Record<string, string>;
  currentProbes: Record<string, string>;
  publishedActions: { agentId: string; description: string; publishedAt: string }[];
}): string {
  return `Compare AEO probes for ${params.brand} (${params.category}) across two time points.

PREVIOUS: ${JSON.stringify(params.previousProbes)}
CURRENT: ${JSON.stringify(params.currentProbes)}
ACTIONS: ${params.publishedActions.map((a) => `${a.agentId}: ${a.description}`).join("; ")}

Summarize per-probe change, signal deltas, next 30-day priorities.`;
}
