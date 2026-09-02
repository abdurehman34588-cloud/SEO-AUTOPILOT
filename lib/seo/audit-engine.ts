import { CrawledPage, FullAudit, AuditIssue } from '@/types/seo';
import { crawlWebsite, CrawlerOptions } from '../crawler/crawler';
import { checkRobotsTxt } from '../crawler/robots';
import { checkSitemap } from '../crawler/sitemap';
import { runTechnicalChecks } from './technical-checks';
import { runOnPageChecks } from './on-page-checks';
import { runContentChecks } from './content-checks';
import { runLinksChecks } from './links-checks';
import { calculateSeoScores } from '../scoring/score-calculator';
import { getAiProvider } from '../ai/ai-provider';

export interface AuditRunOptions extends CrawlerOptions {
  aiProviderName?: string;
  aiApiKey?: string;
}

/**
 * Runs a complete SEO audit on the target URL.
 */
export async function runFullAudit(
  targetUrl: string,
  options: AuditRunOptions = {}
): Promise<FullAudit> {
  const auditId = Math.random().toString(36).substring(2, 12);
  const now = new Date().toISOString();
  const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
  const origin = urlObj.origin;

  // 1. Check robots.txt & sitemap in parallel
  const [robotsInfo, sitemapInfo] = await Promise.all([
    checkRobotsTxt(origin),
    checkSitemap(origin),
  ]);

  // 2. Crawl website pages
  const { pages } = await crawlWebsite(targetUrl, {
    maxPages: options.maxPages || 10,
    maxDepth: options.maxDepth || 2,
    timeoutMs: options.timeoutMs || 8000,
    onProgress: options.onProgress,
  });

  if (pages.length === 0) {
    throw new Error(`Unable to fetch or connect to ${targetUrl}. Please verify the website is publicly accessible.`);
  }

  // Update pages with robots/sitemap info
  for (const page of pages) {
    page.hasRobotsTxt = robotsInfo.exists;
    page.hasSitemap = sitemapInfo.exists;
  }

  // 3. Run SEO checks
  const techIssues = runTechnicalChecks(pages, robotsInfo, sitemapInfo);
  const onPageIssues = runOnPageChecks(pages);
  const contentIssues = runContentChecks(pages);
  const linksIssues = runLinksChecks(pages);

  const allIssues: AuditIssue[] = [
    ...techIssues,
    ...onPageIssues,
    ...contentIssues,
    ...linksIssues,
  ];

  // Attach issues to individual pages where applicable
  for (const page of pages) {
    page.issues = allIssues.filter(i => i.pageUrl === page.url || i.pageId === page.id);
  }

  // 4. Calculate weighted scores
  const scoreResults = calculateSeoScores(allIssues);

  // 5. Generate AI Recommendations & Action Plan
  const aiProvider = getAiProvider(options.aiProviderName, options.aiApiKey);
  const aiAnalysis = await aiProvider.generateRecommendations({
    url: targetUrl,
    score: scoreResults.overallScore,
    technicalScore: scoreResults.technicalScore,
    onPageScore: scoreResults.onPageScore,
    contentScore: scoreResults.contentScore,
    linksScore: scoreResults.linksScore,
    pagesCount: pages.length,
    issues: allIssues,
    pages,
  });

  return {
    id: auditId,
    url: targetUrl,
    normalizedUrl: origin + urlObj.pathname,
    status: 'completed',
    score: scoreResults.overallScore,
    technicalScore: scoreResults.technicalScore,
    onPageScore: scoreResults.onPageScore,
    contentScore: scoreResults.contentScore,
    linksScore: scoreResults.linksScore,
    isDemo: false,
    summary: aiAnalysis.summary,
    createdAt: now,
    completedAt: new Date().toISOString(),
    pages,
    issues: allIssues,
    recommendations: aiAnalysis.priorityActions,
    quickWins: aiAnalysis.quickWins,
  };
}
