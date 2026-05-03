export type CheckStatus = "pass" | "fail" | "warning" | "unknown";
export type AeoImpact = "critical" | "high" | "medium" | "low";

export interface CheckDefinition {
  id: string;
  category: string;
  name: string;
  aeoImpact: AeoImpact;
  fixAgentId: string | null;
  auto: boolean;
}
export const CHECK_DEFINITIONS: CheckDefinition[] = [
  // A — Brand Identity
  { id: "A1", category: "Brand Identity", name: "Homepage has clear 1-sentence definition with category name", aeoImpact: "high", fixAgentId: "canonical_definition", auto: true },
  { id: "A2", category: "Brand Identity", name: "Meta description contains category + buyer + outcome", aeoImpact: "medium", fixAgentId: "semantic_keyword", auto: true },
  { id: "A3", category: "Brand Identity", name: "Brand name spelled identically across website + G2 + LinkedIn", aeoImpact: "medium", fixAgentId: "brand_consistency", auto: false },
  { id: "A4", category: "Brand Identity", name: "About page exists and names the founder", aeoImpact: "high", fixAgentId: null, auto: true },
  { id: "A5", category: "Brand Identity", name: "Twitter/X bio contains category keyword", aeoImpact: "low", fixAgentId: null, auto: false },
  // B — Reviews
  { id: "B1", category: "Review Platforms", name: "Brand has a G2 profile", aeoImpact: "high", fixAgentId: null, auto: false },
  { id: "B2", category: "Review Platforms", name: "G2 profile has 10+ reviews", aeoImpact: "medium", fixAgentId: null, auto: false },
  { id: "B3", category: "Review Platforms", name: "Brand has a Capterra profile", aeoImpact: "medium", fixAgentId: null, auto: false },
  { id: "B4", category: "Review Platforms", name: "Brand appears on AlternativeTo", aeoImpact: "low", fixAgentId: null, auto: false },
  // C — Directory
  { id: "C1", category: "Directory Presence", name: "Brand has a Crunchbase entry", aeoImpact: "medium", fixAgentId: null, auto: false },
  { id: "C2", category: "Directory Presence", name: "Brand is listed on Product Hunt", aeoImpact: "medium", fixAgentId: null, auto: false },
  { id: "C3", category: "Directory Presence", name: "Brand appears in at least 2 roundup articles", aeoImpact: "high", fixAgentId: null, auto: false },
  { id: "C4", category: "Directory Presence", name: "Brand has Wikipedia or Wikidata entry", aeoImpact: "medium", fixAgentId: null, auto: false },
  // D — Community
  { id: "D1", category: "Community", name: "Brand mentioned in at least 2 relevant subreddits", aeoImpact: "medium", fixAgentId: "community_post", auto: false },
  { id: "D2", category: "Community", name: "Brand has an Indie Hackers product page", aeoImpact: "medium", fixAgentId: null, auto: false },
  { id: "D3", category: "Community", name: "Brand discussed on HackerNews", aeoImpact: "medium", fixAgentId: null, auto: false },
  { id: "D4", category: "Community", name: "Founder has active Twitter/X presence", aeoImpact: "low", fixAgentId: null, auto: false },
  // E — Content
  { id: "E1", category: "Content", name: "Website has FAQ page with question-format headings", aeoImpact: "high", fixAgentId: "technical_aeo", auto: true },
  { id: "E2", category: "Content", name: "FAQ page has JSON-LD schema markup", aeoImpact: "high", fixAgentId: "technical_aeo", auto: true },
  { id: "E3", category: "Content", name: "At least 1 case study with outcome metrics", aeoImpact: "high", fixAgentId: null, auto: false },
  { id: "E4", category: "Content", name: "Homepage uses category keywords 3+ times", aeoImpact: "medium", fixAgentId: "semantic_keyword", auto: true },
  { id: "E5", category: "Content", name: "Buyer job titles mentioned explicitly", aeoImpact: "medium", fixAgentId: "semantic_keyword", auto: true },
  // F — Founder
  { id: "F1", category: "Founder Entity", name: "Founder name appears on website with role", aeoImpact: "high", fixAgentId: null, auto: false },
  { id: "F2", category: "Founder Entity", name: "Founder LinkedIn findable + category keyword in headline", aeoImpact: "medium", fixAgentId: null, auto: false },
  { id: "F3", category: "Founder Entity", name: "Founder name co-appears with brand in 2+ external sources", aeoImpact: "medium", fixAgentId: null, auto: false },
  // G — Technical
  { id: "G1", category: "Technical", name: "Website renders HTML (not JS-only)", aeoImpact: "critical", fixAgentId: "technical_aeo", auto: true },
  { id: "G2", category: "Technical", name: "Page load under 3 seconds", aeoImpact: "high", fixAgentId: "technical_aeo", auto: true },
  { id: "G3", category: "Technical", name: "Sitemap.xml exists", aeoImpact: "high", fixAgentId: "technical_aeo", auto: true },
  { id: "G4", category: "Technical", name: "robots.txt allows key pages", aeoImpact: "medium", fixAgentId: "technical_aeo", auto: true },
  { id: "G5", category: "Technical", name: "Key pages have unique title tags", aeoImpact: "medium", fixAgentId: "technical_aeo", auto: true },
];
