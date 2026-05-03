import * as cheerio from "cheerio";
import type { TechnicalCrawlData } from "./crawl";
import { CHECK_DEFINITIONS, type CheckDefinition, type CheckStatus } from "./checks";

export interface RunChecklistInput {
  brandUrl: string;
  category: string;
  crawl: TechnicalCrawlData;
}

function scoreFromStatuses(items: { status: CheckStatus }[]): number {
  const weights: Record<CheckStatus, number> = {
    pass: 1,
    warning: 0.5,
    unknown: 0.4,
    fail: 0,
  };
  if (!items.length) return 0;
  const sum = items.reduce((a, i) => a + weights[i.status], 0);
  return Math.round((sum / items.length) * 100);
}

async function evaluateCheck(
  def: CheckDefinition,
  brandUrl: string,
  category: string,
  crawl: TechnicalCrawlData
): Promise<{
  checkId: string;
  category: string;
  name: string;
  status: CheckStatus;
  aeoImpact: string;
  fixAgentId: string | null;
  detail: string;
}> {
  let status: CheckStatus = "unknown";
  let detail = "Requires manual verification.";

  if (!def.auto) {
    return {
      checkId: def.id,
      category: def.category,
      name: def.name,
      status,
      aeoImpact: def.aeoImpact,
      fixAgentId: def.fixAgentId,
      detail,
    };
  }

  const catLower = category.toLowerCase();
  const html = crawl.homepageSnippet;
  const combined = `${html}`.toLowerCase();

  switch (def.id) {
    case "A1": {
      const firstPara = combined.slice(0, 600);
      const hasCat = firstPara.includes(catLower);
      status = hasCat && combined.length > 80 ? "pass" : "warning";
      detail = hasCat
        ? "Homepage text mentions category near the top."
        : "Could not confirm a clear category-led definition in visible text.";
      break;
    }
    case "A2": {
      const hasMeta = crawl.metaDescriptions.some((m) =>
        m.toLowerCase().includes(catLower)
      );
      status = hasMeta ? "pass" : "fail";
      detail = hasMeta
        ? "Meta description references category."
        : "Meta description missing or lacks category keyword.";
      break;
    }
    case "A4": {
      try {
        const origin = new URL(brandUrl).origin;
        const paths = ["/about", "/company", "/team", "/about-us"];
        let found = false;
        for (const p of paths) {
          const u = origin + p;
          const t = await fetch(u, {
            headers: { "User-Agent": "AEO-Bot/1.0" },
            signal: AbortSignal.timeout(8000),
          }).catch(() => null);
          if (t?.ok) {
            const h = await t.text();
            if (h.length > 500) {
              found = true;
              break;
            }
          }
        }
        status = found ? "warning" : "unknown";
        detail = found
          ? "Found an about/company URL responding (verify founder name)."
          : "Could not confirm /about-style page automatically.";
      } catch {
        status = "unknown";
      }
      break;
    }
    case "E1":
    case "E2": {
      const faqHint =
        combined.includes("faq") ||
        /frequently asked/i.test(combined) ||
        crawl.questionHeadings > 0;
      if (def.id === "E1") {
        status = faqHint ? "warning" : "fail";
        detail = faqHint
          ? "Possible FAQ or question headings detected (confirm page)."
          : "No strong FAQ signals in homepage crawl.";
      } else {
        status = crawl.hasFaqSchema ? "pass" : "warning";
        detail = crawl.hasFaqSchema
          ? "FAQ JSON-LD detected on crawled page."
          : "FAQ JSON-LD not detected.";
      }
      break;
    }
    case "E4": {
      const hits = catLower
        ? (combined.match(new RegExp(catLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length
        : 0;
      status = hits >= 3 ? "pass" : hits >= 1 ? "warning" : "fail";
      detail = `Category keyword occurrences (homepage text sample): ~${hits}`;
      break;
    }
    case "E5": {
      const titles =
        /\b(ceo|cto|cmo|founder|marketing director|vp|engineer|developer|designer|manager)\b/i.test(
          combined
        );
      status = titles ? "warning" : "fail";
      detail = titles
        ? "Job-title language detected on site."
        : "Limited job-title language in sample.";
      break;
    }
    case "G1":
      status = crawl.hasHtmlContent ? "pass" : "fail";
      detail = crawl.hasHtmlContent
        ? "Substantial HTML content returned."
        : "Possible JS-only or thin HTML response.";
      break;
    case "G2":
      status = crawl.loadTimeMs < 3000 ? "pass" : "warning";
      detail = `First byte/content timing ~${crawl.loadTimeMs}ms (server crawl, not full RUM).`;
      break;
    case "G3":
      status = crawl.hasSitemap ? "pass" : "fail";
      detail = crawl.hasSitemap ? "sitemap.xml reachable." : "sitemap.xml not found.";
      break;
    case "G4": {
      const r = crawl.robotsTxt.toLowerCase();
      const blocksAll =
        /^disallow:\s*\/\s*$/m.test(r) || r.includes("disallow: /");
      status = r.length === 0 ? "warning" : blocksAll ? "fail" : "pass";
      detail =
        r.length === 0
          ? "robots.txt missing or empty."
          : blocksAll
            ? "robots.txt may block entire site — review."
            : "robots.txt present.";
      break;
    }
    case "G5": {
      const uniq = new Set(crawl.titleTags);
      status =
        crawl.titleTags.length === 0
          ? "fail"
          : uniq.size >= crawl.titleTags.length
            ? "warning"
            : "warning";
      detail = `Titles sampled: ${crawl.titleTags.length} (multi-page crawl not run — heuristic).`;
      break;
    }
    default:
      status = "unknown";
      detail = "Auto rule not implemented; confirm manually.";
  }

  return {
    checkId: def.id,
    category: def.category,
    name: def.name,
    status,
    aeoImpact: def.aeoImpact,
    fixAgentId: def.fixAgentId,
    detail,
  };
}

export async function runChecklistAuto(input: RunChecklistInput) {
  const { brandUrl, category, crawl } = input;

  const items = await Promise.all(
    CHECK_DEFINITIONS.map((def) => evaluateCheck(def, brandUrl, category, crawl))
  );

  const overallScore = scoreFromStatuses(items as { status: CheckStatus }[]);

  const categoryScores: Record<string, number> = {};
  const cats = Array.from(new Set(CHECK_DEFINITIONS.map((c) => c.category)));
  for (const c of cats) {
    const sub = items.filter((i) => i.category === c);
    categoryScores[c] = scoreFromStatuses(sub as { status: CheckStatus }[]);
  }

  return { overallScore, categoryScores, items };
}

/** Extract visible text from homepage for semantic keyword agent */
export function extractWebsiteCopyFromHtml(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  return $("body").text().replace(/\s+/g, " ").trim().slice(0, 12000);
}
