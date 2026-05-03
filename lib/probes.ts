import type { BrandContext } from "@/types";

export interface ProbeDef {
  id: string;
  label: string;
  query: string;
}

export function buildProbes(ctx: BrandContext): ProbeDef[] {
  const { url, brandRef, category, competitors, useCases } = ctx;
  return [
    {
      id: "recognition",
      label: "Brand recognition",
      query: `What is ${brandRef} (${url})? Describe what it does, who uses it, and what problem it solves. Be specific. If your knowledge is limited, say so explicitly.`,
    },
    {
      id: "category_rank",
      label: "Category visibility",
      query: `What are the best tools for ${category}? List your top 5-7 with a brief reason for each.`,
    },
    {
      id: "usecase",
      label: "Use case association",
      query: `I need a tool for: ${useCases || category}. What do you recommend and why?`,
    },
    {
      id: "comparison",
      label: "Comparison coverage",
      query: `Compare ${brandRef} (${url}) with ${competitors || "alternatives in the " + category + " space"}. List key differences.`,
    },
    {
      id: "entity",
      label: "Founder & entity association",
      query: `Who is behind ${brandRef} at ${url}? Tell me about the company and the people who built it.`,
    },
    {
      id: "outcomes",
      label: "Outcome language",
      query: `What specific results and outcomes do users typically get from using ${brandRef} (${url})?`,
    },
    {
      id: "definition",
      label: "Canonical definition",
      query: `Give an authoritative, category-specific definition of ${brandRef} (${url}). What niche does it serve?`,
    },
  ];
}
