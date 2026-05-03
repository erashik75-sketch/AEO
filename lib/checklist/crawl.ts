import * as cheerio from "cheerio";

export interface TechnicalCrawlData {
  hasHtmlContent: boolean;
  loadTimeMs: number;
  hasSitemap: boolean;
  robotsTxt: string;
  hasFaqSchema: boolean;
  titleTags: string[];
  h1Tags: string[];
  questionHeadings: number;
  metaDescriptions: string[];
  homepageSnippet: string;
}

function normalizeUrl(base: string, path: string): string {
  try {
    const u = new URL(path, base);
    return u.href;
  } catch {
    return base;
  }
}

async function fetchText(url: string, timeoutMs = 12000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "AEO-Bot/1.0" },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function checkUrlExists(url: string): Promise<boolean> {
  const txt = await fetchText(url);
  return txt !== null && txt.length > 100;
}

export async function crawlForTechnicalAudit(url: string): Promise<TechnicalCrawlData> {
  const start = Date.now();
  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AEO-Bot/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    html = await res.text();
  } catch {
    html = "";
  }
  const loadTimeMs = Date.now() - start;

  const base = new URL(url).origin;
  const sitemapOk = await checkUrlExists(normalizeUrl(base, "/sitemap.xml"));
  let robotsTxt = "";
  const robotsRaw = await fetchText(normalizeUrl(base, "/robots.txt"));
  if (robotsRaw) robotsTxt = robotsRaw.slice(0, 2000);

  const $ = cheerio.load(html);
  const titleTags = $("title")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  const h1Tags = $("h1")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  let questionHeadings = 0;
  $("h2, h3").each((_, el) => {
    const t = $(el).text().trim();
    if (/\?/.test(t)) questionHeadings += 1;
  });
  const metaDescriptions = $('meta[name="description"]')
    .map((_, el) => $(el).attr("content")?.trim() ?? "")
    .get()
    .filter(Boolean);

  const hasFaqSchema =
    /"@type"\s*:\s*"FAQPage"/i.test(html) ||
    /FAQPage/.test(html);

  const homepageSnippet = $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);

  const hasHtmlContent =
    html.length > 800 &&
    !/need to enable javascript/i.test(html.slice(0, 500));

  return {
    hasHtmlContent,
    loadTimeMs,
    hasSitemap: sitemapOk,
    robotsTxt,
    hasFaqSchema,
    titleTags,
    h1Tags,
    questionHeadings,
    metaDescriptions,
    homepageSnippet,
  };
}

export async function fetchHomepageHtml(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AEO-Bot/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    return await res.text();
  } catch {
    return "";
  }
}
