import { prisma } from "@/lib/prisma";
import { buildProbes } from "@/lib/probes";
import {
  buildAnalysisPrompt,
  buildPlanPrompt,
  buildSynthesisPrompt,
} from "@/lib/prompts/analysis";
import { callClaude } from "@/lib/ai/anthropic";
import { parseJsonObject } from "@/lib/json";
import type { AIModel, Issue, ModelScores, SynthesisResult } from "@/types";
import { crawlForTechnicalAudit, fetchHomepageHtml } from "@/lib/checklist/crawl";
import { extractWebsiteCopyFromHtml, runChecklistAuto } from "@/lib/checklist/runner";
import { modelsForPlan } from "@/lib/plans";
import type { Plan } from "@prisma/client";

function brandRefFromBrand(name: string | null | undefined, url: string): string {
  if (name?.trim()) return name.trim();
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatProbeContext(
  probes: { id: string; label: string; query: string }[],
  responses: Record<string, string>
): string {
  return probes
    .map((p) => {
      const text = responses[p.id] ?? "(no response)";
      return `### ${p.label} (${p.id})\nQ: ${p.query}\nA: ${text.slice(0, 4000)}`;
    })
    .join("\n\n");
}

async function analyzeModel(
  brandRef: string,
  url: string,
  category: string,
  probeContext: string,
  modelLabel: string
): Promise<ModelScores> {
  const prompt = buildAnalysisPrompt(brandRef, url, category, probeContext, modelLabel);
  try {
    const raw = await callClaude(prompt);
    return parseJsonObject<ModelScores>(raw);
  } catch {
    return {
      summary: `Analysis unavailable for ${modelLabel}.`,
      scores: {
        category_clarity: 40,
        usecase_saturation: 40,
        comparison_coverage: 40,
        entity_association: 40,
        authoritative_definition: 40,
      },
      overall: 40,
      issues: [
        {
          id: `fallback-${modelLabel}`,
          signal: 1,
          title: "Incomplete AI analysis",
          severity: "medium",
          brief: "Scoring service returned invalid JSON or failed.",
          score: 40,
        },
      ],
      modelSpecificInsight: "",
    };
  }
}

export async function executeScan(scanId: string): Promise<void> {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { brand: { include: { user: true } } },
  });
  if (!scan) return;

  const brand = scan.brand;
  const userPlan = brand.user.plan as Plan;
  const models = modelsForPlan(userPlan);

  const brandRef = brandRefFromBrand(brand.name, brand.url);
  const probes = buildProbes({
    url: brand.url,
    brandRef,
    category: brand.category,
    competitors: brand.competitors,
    useCases: brand.useCases,
  });

  const claudeProbeAnswers: Record<string, string> = {};
  const openaiProbeAnswers: Record<string, string> = {};
  const perplexityProbeAnswers: Record<string, string> = {};
  const geminiProbeAnswers: Record<string, string> = {};

  const probeFailures: Partial<Record<AIModel, string>> = {};

  for (const p of probes) {
    const { results, failures } = await import("@/lib/ai/router").then((m) =>
      m.runProbeAcrossModels(p.query, models)
    );
    for (const [m, err] of Object.entries(failures)) {
      if (err && !probeFailures[m as AIModel]) {
        probeFailures[m as AIModel] = err;
      }
    }
    if (results.claude) claudeProbeAnswers[p.id] = results.claude;
    if (results.openai) openaiProbeAnswers[p.id] = results.openai;
    if (results.perplexity) perplexityProbeAnswers[p.id] = results.perplexity;
    if (results.gemini) geminiProbeAnswers[p.id] = results.gemini;
  }

  await prisma.scan.update({
    where: { id: scanId },
    data: {
      claudeProbes: claudeProbeAnswers as object,
      openaiProbes:
        models.includes("openai") ? (openaiProbeAnswers as object) : undefined,
      perplexityProbes:
        models.includes("perplexity") ? (perplexityProbeAnswers as object) : undefined,
      geminiProbes:
        models.includes("gemini") ? (geminiProbeAnswers as object) : undefined,
      modelFailures: Object.keys(probeFailures).length
        ? (probeFailures as object)
        : undefined,
    },
  });

  const ctxClaude = formatProbeContext(probes, claudeProbeAnswers);
  const ctxOpenai = formatProbeContext(probes, openaiProbeAnswers);
  const ctxPerplexity = formatProbeContext(probes, perplexityProbeAnswers);
  const ctxGemini = formatProbeContext(probes, geminiProbeAnswers);

  const modelScoresMap: Record<string, ModelScores> = {};

  modelScoresMap.claude = await analyzeModel(
    brandRef,
    brand.url,
    brand.category,
    ctxClaude,
    "Claude"
  );

  if (models.includes("openai")) {
    modelScoresMap.openai = await analyzeModel(
      brandRef,
      brand.url,
      brand.category,
      ctxOpenai,
      "ChatGPT"
    );
  }
  if (models.includes("perplexity")) {
    modelScoresMap.perplexity = await analyzeModel(
      brandRef,
      brand.url,
      brand.category,
      ctxPerplexity,
      "Perplexity"
    );
  }
  if (models.includes("gemini")) {
    modelScoresMap.gemini = await analyzeModel(
      brandRef,
      brand.url,
      brand.category,
      ctxGemini,
      "Gemini"
    );
  }

  let synthesis: SynthesisResult;
  try {
    const synRaw = await callClaude(
      buildSynthesisPrompt(brandRef, brand.category, modelScoresMap)
    );
    synthesis = parseJsonObject<SynthesisResult>(synRaw);
  } catch {
    const scores = Object.values(modelScoresMap).map((m) => m.overall);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    synthesis = {
      crossModelScore: avg,
      worstModel: "claude",
      bestModel: "claude",
      universalIssues: modelScoresMap.claude.issues.slice(0, 3),
      modelSpecificIssues: [],
      synthesizedSummary: "Cross-model synthesis unavailable; showing Claude issues as primary.",
    };
  }

  const probeContextFull = [
    `CLAUDE:\n${ctxClaude}`,
    models.includes("openai") ? `OPENAI:\n${ctxOpenai}` : "",
    models.includes("perplexity") ? `PERPLEXITY:\n${ctxPerplexity}` : "",
    models.includes("gemini") ? `GEMINI:\n${ctxGemini}` : "",
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  const issuesCombined: Issue[] = [
    ...(synthesis.universalIssues ?? []).map((i) => ({ ...i })),
    ...(synthesis.modelSpecificIssues ?? []).map((i) => ({ ...i })),
  ];

  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: "COMPLETE",
      claudeScores: modelScoresMap.claude as object,
      openaiScores: modelScoresMap.openai as object | undefined,
      perplexityScores: modelScoresMap.perplexity as object | undefined,
      geminiScores: modelScoresMap.gemini as object | undefined,
      crossModelScore: synthesis.crossModelScore,
      probeContext: probeContextFull,
      summary: synthesis.synthesizedSummary,
      issues: issuesCombined as object,
    },
  });

  const crawl = await crawlForTechnicalAudit(brand.url);
  const homepageHtml = await fetchHomepageHtml(brand.url);
  const snippet =
    homepageHtml.length > crawl.homepageSnippet.length
      ? extractWebsiteCopyFromHtml(homepageHtml)
      : crawl.homepageSnippet;
  const checklist = await runChecklistAuto({
    brandUrl: brand.url,
    category: brand.category,
    crawl: { ...crawl, homepageSnippet: snippet },
  });

  await prisma.checklistRun.create({
    data: {
      scanId,
      brandId: brand.id,
      overallScore: checklist.overallScore,
      categoryScores: checklist.categoryScores as object,
      items: {
        create: checklist.items.map((it) => ({
          checkId: it.checkId,
          category: it.category,
          name: it.name,
          status: it.status,
          aeoImpact: it.aeoImpact,
          fixAgentId: it.fixAgentId,
          detail: it.detail,
        })),
      },
    },
  });

  const checklistFailures = checklist.items.filter((i) => i.status === "fail");

  let planPayload: Record<string, unknown>;
  try {
    const planPrompt = buildPlanPrompt({
      brand: brandRef,
      category: brand.category,
      crossModelScore: synthesis.crossModelScore,
      modelScores: Object.fromEntries(
        Object.entries(modelScoresMap).map(([k, v]) => [k, v.overall])
      ),
      issues: issuesCombined,
      checklistFailures,
      competitors: brand.competitors ?? "",
    });
    const planRaw = await callClaude(planPrompt);
    planPayload = parseJsonObject<Record<string, unknown>>(planRaw);
  } catch {
    planPayload = {
      priorityAction: { title: "Fix critical checklist failures", whyFirst: "Technical blockers", steps: ["Run Technical AEO agent", "Update meta and titles"] },
      phase30: { focus: "Foundation", tasks: [] },
      phase60: { focus: "Amplification", tasks: [] },
      phase90: { focus: "Momentum", tasks: [] },
      modelPriority: "Start with the model where your buyers research most.",
      dependencyOrder: [],
    };
  }

  type TaskShape = { title: string; owner: string; estimate?: string; signalImproved: string; agentId?: string };
  const tasks: { title: string; owner: string; phase: number; type: string; signalImproved: string; agentId?: string }[] = [];

  const pushTasks = (phase: number, bucket: { tasks?: TaskShape[] } | undefined) => {
    for (const t of bucket?.tasks ?? []) {
      tasks.push({
        title: t.title,
        owner: t.owner ?? "founder",
        phase,
        type: "one-time",
        signalImproved: t.signalImproved ?? "mixed",
        agentId: t.agentId,
      });
    }
  };

  pushTasks(30, planPayload.phase30 as { tasks?: TaskShape[] });
  pushTasks(60, planPayload.phase60 as { tasks?: TaskShape[] });
  pushTasks(90, planPayload.phase90 as { tasks?: TaskShape[] });

  await prisma.aEOPlan.create({
    data: {
      brandId: brand.id,
      scanId,
      summary: planPayload as object,
      tasks: { create: tasks },
    },
  });
}
