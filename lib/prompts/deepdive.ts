export type DeepDiveTab = "why" | "evidence" | "fix" | "content";

export function buildDeepDivePrompt(params: {
  tab: DeepDiveTab;
  brandRef: string;
  url: string;
  category: string;
  issueTitle: string;
  issueBrief: string;
  probeContext: string;
}): string {
  const { tab, brandRef, url, category, issueTitle, issueBrief, probeContext } =
    params;
  const base = `Brand: ${brandRef} (${url}), category: ${category}.
Issue: ${issueTitle}
Summary: ${issueBrief}

Probe context:
${probeContext}
`;

  switch (tab) {
    case "why":
      return `${base}\nExplain in 2-3 short paragraphs WHY this issue hurts AEO for this brand. Be specific to the probe evidence.`;
    case "evidence":
      return `${base}\nList concrete evidence quotes or paraphrases from the probes that support this issue. Use bullet points.`;
    case "fix":
      return `${base}\nProvide a numbered fix plan (5-8 steps) the founder can execute in the next 7 days.`;
    case "content":
      return `${base}\nDraft ready-to-use copy snippets (headline, 2 short paragraphs, FAQ Q&A pair) that address this issue.`;
    default:
      return base;
  }
}
