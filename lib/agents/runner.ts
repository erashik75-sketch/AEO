import { prisma } from "@/lib/prisma";
import { callAgentLlm } from "@/lib/ai/llm-router";
import {
  buildCanonicalDefinitionPrompt,
  buildConsistencyAuditPrompt,
  buildExampleReviewPrompt,
  buildIndieHackersPostPrompt,
  buildRedditPostPrompt,
  buildSemanticKeywordPrompt,
  buildTechnicalAuditPrompt,
} from "@/lib/prompts/agents";
import { crawlForTechnicalAudit, fetchHomepageHtml } from "@/lib/checklist/crawl";
import { extractWebsiteCopyFromHtml } from "@/lib/checklist/runner";
import type { Plan } from "@prisma/client";
import { maxAgentsForPlan } from "@/lib/plans";

export type AgentId =
  | "canonical_definition"
  | "semantic_keyword"
  | "brand_consistency"
  | "community_post"
  | "review_outreach"
  | "technical_aeo";

const ORDER: AgentId[] = [
  "canonical_definition",
  "semantic_keyword",
  "brand_consistency",
  "community_post",
  "review_outreach",
  "technical_aeo",
];

export function allowedAgentsForPlan(plan: Plan): AgentId[] {
  const n = maxAgentsForPlan(plan);
  return ORDER.slice(0, n);
}

export async function runAgent(params: {
  scanId: string;
  agentId: AgentId;
  issueId?: string | null;
  userPlan: Plan;
}): Promise<{ content: string }> {
  const allowed = allowedAgentsForPlan(params.userPlan);
  if (!allowed.includes(params.agentId)) {
    throw new Error("Upgrade your plan to run this agent.");
  }

  const scan = await prisma.scan.findUnique({
    where: { id: params.scanId },
    include: { brand: true },
  });
  if (!scan || scan.status !== "COMPLETE") {
    throw new Error("Scan not ready.");
  }

  const brand = scan.brand;
  const probeContext = scan.probeContext ?? "";
  const brandName = brand.name ?? new URL(brand.url).hostname;

  let content = "";

  switch (params.agentId) {
    case "canonical_definition": {
      const prompt = buildCanonicalDefinitionPrompt({
        brand: brandName,
        category: brand.category,
        targetBuyer: "buyer persona",
        coreProblem: "core problem from diagnostics",
        keyFeatures: brand.description ?? "see website",
        coreOutcome: "measurable outcome",
        probeContext,
      });
      content = await callAgentLlm(prompt);
      break;
    }
    case "semantic_keyword": {
      const html = await fetchHomepageHtml(brand.url);
      const websiteCopy = extractWebsiteCopyFromHtml(html);
      const prompt = buildSemanticKeywordPrompt({
        brand: brandName,
        category: brand.category,
        probeContext,
        websiteCopy,
      });
      content = await callAgentLlm(prompt);
      break;
    }
    case "brand_consistency": {
      const prompt = buildConsistencyAuditPrompt({
        brand: brandName,
        category: brand.category,
        canonicalDefinition: brand.description ?? probeContext.slice(0, 1500),
        platformContent: {
          website: probeContext.slice(0, 4000),
        },
      });
      content = await callAgentLlm(prompt);
      break;
    }
    case "community_post": {
      const prompt = buildRedditPostPrompt({
        brand: brandName,
        category: brand.category,
        subreddit: "SaaS",
        subredditCulture: "Founders sharing lessons",
        issueTitle: "Community visibility",
        semanticKeywords: [brand.category],
        probeContext,
      });
      const ih = buildIndieHackersPostPrompt({
        brand: brandName,
        category: brand.category,
        milestone: "Shipped MVP",
        semanticKeywords: [brand.category],
        founderVoice: "direct",
      });
      content =
        (await callAgentLlm(prompt)) + "\n\n---\n\n" + (await callAgentLlm(ih));
      break;
    }
    case "review_outreach": {
      const ex = buildExampleReviewPrompt({
        brand: brandName,
        category: brand.category,
        targetPersona: "marketing manager",
        semanticKeywords: [brand.category],
      });
      content = await callAgentLlm(
        `${ex}\n\nAlso draft a 3-email sequence outline for G2 outreach with subjects and bodies. Brand: ${brandName}`
      );
      break;
    }
    case "technical_aeo": {
      const crawl = await crawlForTechnicalAudit(brand.url);
      const prompt = buildTechnicalAuditPrompt({
        brand: brandName,
        url: brand.url,
        crawlResults: crawl as unknown as Record<string, unknown>,
        probeContext,
      });
      content = await callAgentLlm(prompt);
      break;
    }
    default:
      throw new Error("Unknown agent");
  }

  const issueKey = params.issueId ?? "";

  await prisma.agentOutput.upsert({
    where: {
      scanId_agentId_issueId: {
        scanId: params.scanId,
        agentId: params.agentId,
        issueId: issueKey,
      },
    },
    create: {
      scanId: params.scanId,
      agentId: params.agentId,
      issueId: issueKey,
      content,
      status: "generated",
    },
    update: { content, status: "generated" },
  });

  return { content };
}
