import { AuditIssue, CrawledPage } from '@/types/seo';

/**
 * Runs Content SEO checks across crawled pages.
 */
export function runContentChecks(pages: CrawledPage[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  for (const page of pages) {
    // 1. Word Count / Thin Content Analysis
    if (page.wordCount < 200) {
      issues.push({
        id: `content-thin-${page.id}`,
        category: 'CONTENT',
        title: 'Thin Content Detected',
        severity: 'critical',
        status: 'fail',
        score: 40,
        description: `This page contains only ${page.wordCount} words of readable body text. Pages with very light text may provide limited context for search engine indexers and visitors.`,
        recommendation: 'Evaluate whether this page fulfills search intent. Consider adding informative, high-value text answering common visitor questions (note: word count alone does not guarantee rankings).',
        evidence: `Extracted word count: ${page.wordCount} words`,
        pageUrl: page.url,
        pageId: page.id,
      });
    } else if (page.wordCount < 500) {
      issues.push({
        id: `content-moderate-${page.id}`,
        category: 'CONTENT',
        title: 'Moderate Content Depth',
        severity: 'info',
        status: 'warning',
        score: 75,
        description: `This page has ${page.wordCount} words. While sufficient for simple landing pages or contact forms, comprehensive topic coverage often benefits from deeper explanations.`,
        recommendation: 'Review topic coverage to ensure user queries are thoroughly addressed with clear explanations and examples.',
        evidence: `${page.wordCount} words`,
        pageUrl: page.url,
        pageId: page.id,
      });
    } else {
      issues.push({
        id: `content-depth-pass-${page.id}`,
        category: 'CONTENT',
        title: 'Substantial Content Depth',
        severity: 'info',
        status: 'pass',
        score: 100,
        description: `This page has a solid body of text (${page.wordCount} words), providing substantial topical context.`,
        recommendation: 'Maintain content freshness, factual accuracy, and high editorial quality over time.',
        evidence: `${page.wordCount} words`,
        pageUrl: page.url,
        pageId: page.id,
      });
    }

    // 2. Text-to-Link Ratio Approximation
    if (page.wordCount > 0 && page.internalLinkCount + page.externalLinkCount > 0) {
      const totalLinks = page.internalLinkCount + page.externalLinkCount;
      const wordsPerLink = page.wordCount / totalLinks;

      if (wordsPerLink < 5 && page.wordCount < 300) {
        issues.push({
          id: `content-link-heavy-${page.id}`,
          category: 'CONTENT',
          title: 'High Link Density Relative to Text',
          severity: 'warning',
          status: 'warning',
          score: 65,
          description: `The page has ${totalLinks} links but only ${page.wordCount} words (~${wordsPerLink.toFixed(1)} words per link), resembling a directory or navigation-heavy page.`,
          recommendation: 'Add supporting editorial descriptions and contextual paragraphs to explain linked destinations.',
          evidence: `${page.wordCount} words across ${totalLinks} links`,
          pageUrl: page.url,
          pageId: page.id,
        });
      }
    }

    // 3. Title / Content Topical Relevance Approximation
    if (page.title && page.rawText) {
      const stopWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'your', 'about', 'into', 'over', 'after', 'home', 'page']);
      const titleWords = page.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));

      if (titleWords.length > 0) {
        const textLower = page.rawText.toLowerCase();
        const matchedWords = titleWords.filter(w => textLower.includes(w));
        const matchRatio = matchedWords.length / titleWords.length;

        if (matchRatio < 0.4 && page.wordCount > 150) {
          issues.push({
            id: `content-relevance-${page.id}`,
            category: 'CONTENT',
            title: 'Potential Title-to-Body Relevance Mismatch',
            severity: 'warning',
            status: 'warning',
            score: 70,
            description: `Key keywords from your title tag (${titleWords.slice(0, 3).join(', ')}) were infrequently detected in the main page text.`,
            recommendation: 'Ensure your main topic and focus keywords appear naturally in the page introduction and body paragraphs.',
            evidence: `Found ${matchedWords.length}/${titleWords.length} main title terms in body text`,
            pageUrl: page.url,
            pageId: page.id,
          });
        }
      }
    }
  }

  return issues;
}
